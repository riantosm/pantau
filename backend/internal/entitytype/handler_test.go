package entitytype

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// ---- repository palsu ----

// fakeRepo meniru index unik name_unique_ci dengan strings.EqualFold.
type fakeRepo struct {
	items map[bson.ObjectID]EntityType
}

func (r *fakeRepo) nameTaken(name string, except bson.ObjectID) bool {
	for id, t := range r.items {
		if id != except && strings.EqualFold(t.Name, name) {
			return true
		}
	}
	return false
}

func (r *fakeRepo) List(context.Context) ([]EntityType, error) {
	out := []EntityType{}
	for _, t := range r.items {
		out = append(out, t)
	}
	return out, nil
}

func (r *fakeRepo) Get(_ context.Context, id bson.ObjectID) (EntityType, error) {
	t, ok := r.items[id]
	if !ok {
		return t, ErrNotFound
	}
	return t, nil
}

func (r *fakeRepo) Create(_ context.Context, t *EntityType) error {
	if r.nameTaken(t.Name, bson.NilObjectID) {
		return ErrNameTaken
	}
	t.ID = bson.NewObjectID()
	r.items[t.ID] = *t
	return nil
}

func (r *fakeRepo) Update(_ context.Context, id bson.ObjectID, name, icon string) (EntityType, error) {
	t, ok := r.items[id]
	if !ok {
		return t, ErrNotFound
	}
	if r.nameTaken(name, id) {
		return t, ErrNameTaken
	}
	t.Name, t.Icon = name, icon
	r.items[id] = t
	return t, nil
}

func (r *fakeRepo) Delete(_ context.Context, id bson.ObjectID) error {
	if _, ok := r.items[id]; !ok {
		return ErrNotFound
	}
	delete(r.items, id)
	return nil
}

// fakeUsage: jumlah entitas per jenis.
type fakeUsage map[bson.ObjectID]int64

func (u fakeUsage) CountByType(_ context.Context, id bson.ObjectID) (int64, error) { return u[id], nil }
func (u fakeUsage) CountGroupedByType(context.Context) (map[bson.ObjectID]int64, error) {
	return u, nil
}

// ---- helper ----

type apiResp struct {
	Data  json.RawMessage `json:"data"`
	Error struct {
		Code    string            `json:"code"`
		Fields  map[string]string `json:"fields"`
		Details map[string]any    `json:"details"`
	} `json:"error"`
}

// setup menyiapkan 2 jenis: Kendaraan (dipakai 3 entitas) dan Fasilitas (belum dipakai).
func setup() (r *gin.Engine, used, unused bson.ObjectID) {
	gin.SetMode(gin.TestMode)
	used, unused = bson.NewObjectID(), bson.NewObjectID()
	repo := &fakeRepo{items: map[bson.ObjectID]EntityType{
		used:   {ID: used, Name: "Kendaraan", Icon: "truck"},
		unused: {ID: unused, Name: "Fasilitas", Icon: "building"},
	}}
	r = gin.New()
	NewHandler(repo, fakeUsage{used: 3}).Register(r.Group("/api/v1"))
	return r, used, unused
}

func call(t *testing.T, r *gin.Engine, method, path, body string) (int, apiResp) {
	t.Helper()
	req := httptest.NewRequest(method, path, strings.NewReader(body))
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

// ---- test ----

func TestCreate(t *testing.T) {
	tests := []struct {
		name, body string
		wantCode   int
		wantErr    string
		wantField  string
	}{
		{"valid", `{"name":"Drone","icon":"radio"}`, 201, "", ""},
		{"nama di-trim lalu valid", `{"name":"  Drone  ","icon":"radio"}`, 201, "", ""},
		{"nama 1 karakter", `{"name":"D","icon":"radio"}`, 400, "VALIDATION_ERROR", "name"},
		{"nama > 50", `{"name":"` + strings.Repeat("x", 51) + `","icon":"radio"}`, 400, "VALIDATION_ERROR", "name"},
		{"ikon tidak dikenal", `{"name":"Drone","icon":"car"}`, 400, "VALIDATION_ERROR", "icon"},
		{"ikon kosong", `{"name":"Drone"}`, 400, "VALIDATION_ERROR", "icon"},
		{"nama kembar beda huruf", `{"name":"kendaraan","icon":"truck"}`, 409, "NAME_TAKEN", "name"},
		{"JSON rusak", `{`, 400, "BAD_JSON", ""},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			r, _, _ := setup()
			code, resp := call(t, r, http.MethodPost, "/api/v1/entity-types", tc.body)
			if code != tc.wantCode || resp.Error.Code != tc.wantErr {
				t.Fatalf("dapat %d %q, mau %d %q", code, resp.Error.Code, tc.wantCode, tc.wantErr)
			}
			if tc.wantField != "" && resp.Error.Fields[tc.wantField] == "" {
				t.Fatalf("fields.%s kosong: %v", tc.wantField, resp.Error.Fields)
			}
		})
	}
}

func TestListIncludesEntityCount(t *testing.T) {
	r, used, _ := setup()
	code, resp := call(t, r, http.MethodGet, "/api/v1/entity-types", "")
	if code != 200 {
		t.Fatalf("status %d", code)
	}
	var data []Response
	_ = json.Unmarshal(resp.Data, &data)
	for _, d := range data {
		if d.ID == used.Hex() && d.EntityCount != 3 {
			t.Errorf("entityCount Kendaraan = %d, mau 3", d.EntityCount)
		}
	}
}

func TestUpdate(t *testing.T) {
	r, used, unused := setup()

	if code, resp := call(t, r, http.MethodPut, "/api/v1/entity-types/"+unused.Hex(), `{"name":"KENDARAAN","icon":"truck"}`); code != 409 || resp.Error.Code != "NAME_TAKEN" {
		t.Errorf("ganti ke nama yang dipakai: %d %s", code, resp.Error.Code)
	}
	// Mengganti huruf besar/kecil nama sendiri boleh.
	if code, _ := call(t, r, http.MethodPut, "/api/v1/entity-types/"+used.Hex(), `{"name":"KENDARAAN","icon":"truck"}`); code != 200 {
		t.Errorf("ubah nama sendiri: %d", code)
	}
	if code, _ := call(t, r, http.MethodPut, "/api/v1/entity-types/"+bson.NewObjectID().Hex(), `{"name":"Drone","icon":"radio"}`); code != 404 {
		t.Errorf("ubah jenis yang tidak ada: %d", code)
	}
}

func TestDelete(t *testing.T) {
	r, used, unused := setup()

	code, resp := call(t, r, http.MethodDelete, "/api/v1/entity-types/"+used.Hex(), "")
	if code != 409 || resp.Error.Code != "TYPE_IN_USE" {
		t.Fatalf("hapus jenis yang dipakai: %d %s", code, resp.Error.Code)
	}
	if n, _ := resp.Error.Details["entityCount"].(float64); n != 3 {
		t.Errorf("details.entityCount = %v, mau 3", resp.Error.Details["entityCount"])
	}

	if code, _ := call(t, r, http.MethodDelete, "/api/v1/entity-types/"+unused.Hex(), ""); code != 204 {
		t.Errorf("hapus jenis tak terpakai: %d", code)
	}
	if code, _ := call(t, r, http.MethodDelete, "/api/v1/entity-types/"+unused.Hex(), ""); code != 404 {
		t.Errorf("hapus kedua kali: %d", code)
	}
	if code, resp := call(t, r, http.MethodDelete, "/api/v1/entity-types/xyz", ""); code != 400 || resp.Error.Code != "INVALID_ID" {
		t.Errorf("id rusak: %d %s", code, resp.Error.Code)
	}
}

// Daftar ikon di tag validate harus sama dengan variabel Icons.
func TestIconsMatchValidateTag(t *testing.T) {
	r, _, _ := setup()
	for _, icon := range Icons {
		body := `{"name":"Jenis ` + icon + `","icon":"` + icon + `"}`
		if code, _ := call(t, r, http.MethodPost, "/api/v1/entity-types", body); code != 201 {
			t.Errorf("ikon %q ditolak (%d)", icon, code)
		}
	}
}
