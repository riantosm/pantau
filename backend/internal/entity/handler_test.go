package entity

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// ---- repository palsu (in-memory) ----

type fakeRepo struct {
	items map[bson.ObjectID]Entity
}

func newFakeRepo() *fakeRepo { return &fakeRepo{items: map[bson.ObjectID]Entity{}} }

func (r *fakeRepo) List(_ context.Context, f Filter) ([]Entity, error) {
	out := []Entity{}
	for _, e := range r.items {
		if f.TypeID != nil && e.TypeID != *f.TypeID {
			continue
		}
		if f.Status != "" && e.Status != f.Status {
			continue
		}
		if f.Q != "" && !strings.Contains(strings.ToLower(e.Name), strings.ToLower(f.Q)) {
			continue
		}
		out = append(out, e)
	}
	return out, nil
}

func (r *fakeRepo) Get(_ context.Context, id bson.ObjectID) (Entity, error) {
	e, ok := r.items[id]
	if !ok {
		return e, ErrNotFound
	}
	return e, nil
}

func (r *fakeRepo) Create(_ context.Context, e *Entity) error {
	e.ID = bson.NewObjectID()
	e.CreatedAt, e.UpdatedAt = time.Now(), time.Now()
	r.items[e.ID] = *e
	return nil
}

func (r *fakeRepo) Update(_ context.Context, id bson.ObjectID, e Entity) (Entity, error) {
	old, ok := r.items[id]
	if !ok {
		return e, ErrNotFound
	}
	e.ID, e.CreatedAt, e.UpdatedAt = id, old.CreatedAt, time.Now()
	r.items[id] = e
	return e, nil
}

func (r *fakeRepo) Delete(_ context.Context, id bson.ObjectID) error {
	if _, ok := r.items[id]; !ok {
		return ErrNotFound
	}
	delete(r.items, id)
	return nil
}

type fakeTypes map[bson.ObjectID]bool

func (t fakeTypes) Exists(_ context.Context, id bson.ObjectID) (bool, error) { return t[id], nil }

// ---- helper ----

var knownType = bson.NewObjectID()

func setup() (*gin.Engine, *fakeRepo) {
	gin.SetMode(gin.TestMode)
	repo := newFakeRepo()
	r := gin.New()
	NewHandler(repo, fakeTypes{knownType: true}).Register(r.Group("/api/v1"))
	return r, repo
}

type apiResp struct {
	Data  json.RawMessage `json:"data"`
	Total int             `json:"total"`
	Error struct {
		Code   string            `json:"code"`
		Fields map[string]string `json:"fields"`
	} `json:"error"`
}

func call(t *testing.T, r *gin.Engine, method, path, body string) (int, apiResp) {
	t.Helper()
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	var resp apiResp
	if w.Body.Len() > 0 {
		if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
			t.Fatalf("respons bukan JSON: %s", w.Body.String())
		}
	}
	return w.Code, resp
}

// validBody membuat body JSON valid; override mengganti/menambah field tertentu.
func validBody(override map[string]any) string {
	b := map[string]any{
		"name":        "Truk Logistik 01",
		"typeId":      knownType.Hex(),
		"status":      "active",
		"description": "Rute Bandung - Jakarta",
		"latitude":    -6.9175,
		"longitude":   107.6191,
		"attributes":  map[string]string{"Plat nomor": "D 8123 AB"},
	}
	for k, v := range override {
		if v == nil {
			delete(b, k)
		} else {
			b[k] = v
		}
	}
	out, _ := json.Marshal(b)
	return string(out)
}

// ---- test ----

func TestCreateValidation(t *testing.T) {
	tooManyAttrs := map[string]string{}
	for i := 0; i < 11; i++ {
		tooManyAttrs[string(rune('a'+i))] = "x"
	}

	tests := []struct {
		name      string
		body      string
		wantCode  int
		wantErr   string // kode error yang diharapkan ("" kalau sukses)
		wantField string // field yang harus ada di error.fields
	}{
		{"valid", validBody(nil), 201, "", ""},
		{"latitude 0 valid (khatulistiwa)", validBody(map[string]any{"latitude": 0, "longitude": 0}), 201, "", ""},
		{"nama kosong", validBody(map[string]any{"name": "   "}), 400, "VALIDATION_ERROR", "name"},
		{"nama terlalu pendek", validBody(map[string]any{"name": "ab"}), 400, "VALIDATION_ERROR", "name"},
		{"latitude 91", validBody(map[string]any{"latitude": 91}), 400, "VALIDATION_ERROR", "latitude"},
		{"longitude -181", validBody(map[string]any{"longitude": -181}), 400, "VALIDATION_ERROR", "longitude"},
		{"longitude tidak dikirim", validBody(map[string]any{"longitude": nil}), 400, "VALIDATION_ERROR", "longitude"},
		{"latitude berupa teks", validBody(map[string]any{"latitude": "abc"}), 400, "VALIDATION_ERROR", "latitude"},
		{"status tidak dikenal", validBody(map[string]any{"status": "rusak"}), 400, "VALIDATION_ERROR", "status"},
		{"typeId bukan ObjectID", validBody(map[string]any{"typeId": "abc"}), 400, "VALIDATION_ERROR", "typeId"},
		{"typeId tidak ada", validBody(map[string]any{"typeId": bson.NewObjectID().Hex()}), 400, "VALIDATION_ERROR", "typeId"},
		{"deskripsi > 500", validBody(map[string]any{"description": strings.Repeat("x", 501)}), 400, "VALIDATION_ERROR", "description"},
		{"atribut > 10", validBody(map[string]any{"attributes": tooManyAttrs}), 400, "VALIDATION_ERROR", "attributes"},
		{"nama atribut kosong", validBody(map[string]any{"attributes": map[string]string{" ": "x"}}), 400, "VALIDATION_ERROR", "attributes"},
		{"JSON rusak", `{"name": `, 400, "BAD_JSON", ""},
		{"body kosong", ``, 400, "BAD_JSON", ""},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			r, _ := setup()
			code, resp := call(t, r, http.MethodPost, "/api/v1/entities", tc.body)

			if code != tc.wantCode {
				t.Fatalf("status = %d, mau %d (error %+v)", code, tc.wantCode, resp.Error)
			}
			if resp.Error.Code != tc.wantErr {
				t.Fatalf("kode error = %q, mau %q", resp.Error.Code, tc.wantErr)
			}
			if tc.wantField != "" && resp.Error.Fields[tc.wantField] == "" {
				t.Fatalf("fields.%s kosong, fields = %v", tc.wantField, resp.Error.Fields)
			}
		})
	}
}

func TestCreateTrimsAndReturnsCoordinates(t *testing.T) {
	r, _ := setup()
	code, resp := call(t, r, http.MethodPost, "/api/v1/entities",
		validBody(map[string]any{"name": "  Sensor Suhu  ", "latitude": -6.9147, "longitude": 107.6098}))
	if code != 201 {
		t.Fatalf("status = %d", code)
	}
	var got Response
	_ = json.Unmarshal(resp.Data, &got)
	if got.Name != "Sensor Suhu" {
		t.Errorf("nama tidak di-trim: %q", got.Name)
	}
	if got.Latitude != -6.9147 || got.Longitude != 107.6098 {
		t.Errorf("koordinat tertukar: lat=%v lng=%v", got.Latitude, got.Longitude)
	}
}

func TestGetUpdateDelete(t *testing.T) {
	r, repo := setup()
	e := Entity{Name: "Motor Kurir 07", TypeID: knownType, Status: "active", Location: NewPoint(-6.9, 107.6)}
	_ = repo.Create(context.Background(), &e)
	path := "/api/v1/entities/" + e.ID.Hex()
	missing := "/api/v1/entities/" + bson.NewObjectID().Hex()

	if code, resp := call(t, r, http.MethodGet, "/api/v1/entities/bukan-id", ""); code != 400 || resp.Error.Code != "INVALID_ID" {
		t.Errorf("GET id rusak: %d %s", code, resp.Error.Code)
	}
	if code, resp := call(t, r, http.MethodGet, missing, ""); code != 404 || resp.Error.Code != "NOT_FOUND" {
		t.Errorf("GET tidak ada: %d %s", code, resp.Error.Code)
	}
	if code, _ := call(t, r, http.MethodGet, path, ""); code != 200 {
		t.Errorf("GET ada: %d", code)
	}

	code, resp := call(t, r, http.MethodPut, path, validBody(map[string]any{"name": "Motor Kurir 07B", "status": "maintenance"}))
	var got Response
	_ = json.Unmarshal(resp.Data, &got)
	if code != 200 || got.Name != "Motor Kurir 07B" || got.Status != "maintenance" {
		t.Errorf("PUT: %d %+v", code, got)
	}
	if code, _ := call(t, r, http.MethodPut, missing, validBody(nil)); code != 404 {
		t.Errorf("PUT tidak ada: %d", code)
	}

	if code, _ := call(t, r, http.MethodDelete, path, ""); code != 204 {
		t.Errorf("DELETE: %d", code)
	}
	if code, _ := call(t, r, http.MethodDelete, path, ""); code != 404 {
		t.Errorf("DELETE kedua kali harus 404, dapat %d", code)
	}
}

func TestListFilter(t *testing.T) {
	r, repo := setup()
	other := bson.NewObjectID()
	for _, e := range []Entity{
		{Name: "Truk A", TypeID: knownType, Status: "active", Location: NewPoint(0, 0)},
		{Name: "Truk B", TypeID: knownType, Status: "inactive", Location: NewPoint(0, 0)},
		{Name: "Sensor C", TypeID: other, Status: "active", Location: NewPoint(0, 0)},
	} {
		_ = repo.Create(context.Background(), &e)
	}

	tests := []struct {
		query string
		want  int
	}{
		{"", 3},
		{"?status=active", 2},
		{"?typeId=" + knownType.Hex(), 2},
		{"?q=truk", 2},
		{"?q=TRUK&status=inactive", 1},
	}
	for _, tc := range tests {
		code, resp := call(t, r, http.MethodGet, "/api/v1/entities"+tc.query, "")
		if code != 200 || resp.Total != tc.want {
			t.Errorf("GET %q: status %d total %d, mau %d", tc.query, code, resp.Total, tc.want)
		}
	}

	if code, resp := call(t, r, http.MethodGet, "/api/v1/entities?status=rusak", ""); code != 400 || resp.Error.Fields["status"] == "" {
		t.Errorf("filter status salah harus 400, dapat %d", code)
	}
}
