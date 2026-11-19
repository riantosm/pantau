package entity

import (
	"strings"
	"time"
	"unicode/utf8"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// Input adalah body POST/PUT /entities.
//
// Latitude dan Longitude memakai *float64 (pointer), bukan float64.
// Alasannya: `required` menganggap angka 0 sebagai "kosong", padahal latitude 0
// (garis khatulistiwa) itu valid. Dengan pointer, "tidak dikirim" = nil, sedangkan 0 tetap 0.
type Input struct {
	Name        string            `json:"name" validate:"required,min=3,max=100"`
	TypeID      string            `json:"typeId" validate:"required,objectid"`
	Status      string            `json:"status" validate:"required,oneof=active inactive maintenance"`
	Description string            `json:"description" validate:"max=500"`
	Latitude    *float64          `json:"latitude" validate:"required,lat"`
	Longitude   *float64          `json:"longitude" validate:"required,lng"`
	Attributes  map[string]string `json:"attributes"` // divalidasi manual di validateAttributes
}

// Batas atribut key-value.
const (
	maxAttributes   = 10
	maxAttrKeyLen   = 30
	maxAttrValueLen = 100
)

// Normalize merapikan input sebelum divalidasi.
func (in *Input) Normalize() {
	in.Name = strings.TrimSpace(in.Name)
	in.TypeID = strings.TrimSpace(in.TypeID)
	in.Status = strings.TrimSpace(in.Status)
	in.Description = strings.TrimSpace(in.Description)

	clean := make(map[string]string, len(in.Attributes))
	for k, v := range in.Attributes {
		clean[strings.TrimSpace(k)] = strings.TrimSpace(v)
	}
	in.Attributes = clean
}

// validateAttributes memeriksa atribut. Dipisah dari tag `validate` supaya
// pesan untuk key dan value bisa dibedakan. Hasil kosong berarti valid.
func validateAttributes(attrs map[string]string) string {
	if len(attrs) > maxAttributes {
		return "maksimal 10 atribut"
	}
	for k, v := range attrs {
		switch {
		case k == "":
			return "nama atribut wajib diisi"
		case utf8.RuneCountInString(k) > maxAttrKeyLen:
			return "nama atribut maksimal 30 karakter"
		case utf8.RuneCountInString(v) > maxAttrValueLen:
			return "nilai atribut maksimal 100 karakter"
		}
	}
	return ""
}

// toModel mengubah input yang sudah valid menjadi dokumen DB (tanpa ID dan waktu).
func (in Input) toModel() Entity {
	typeID, _ := bson.ObjectIDFromHex(in.TypeID) // sudah dicek oleh tag objectid
	return Entity{
		Name:        in.Name,
		TypeID:      typeID,
		Status:      in.Status,
		Description: in.Description,
		Location:    NewPoint(*in.Latitude, *in.Longitude),
		Attributes:  in.Attributes,
	}
}

// ListFilter adalah query string GET /entities?typeId=&status=&q=
type ListFilter struct {
	TypeID string `form:"typeId" json:"typeId" validate:"omitempty,objectid"`
	Status string `form:"status" json:"status" validate:"omitempty,oneof=active inactive maintenance"`
	Q      string `form:"q" json:"q" validate:"max=100"`
}

// Response adalah bentuk entitas yang dikirim ke frontend.
// Koordinat dikirim sebagai latitude/longitude eksplisit, bukan GeoJSON.
type Response struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	TypeID      string            `json:"typeId"`
	Status      string            `json:"status"`
	Description string            `json:"description"`
	Latitude    float64           `json:"latitude"`
	Longitude   float64           `json:"longitude"`
	Attributes  map[string]string `json:"attributes"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt"`
}

func toResponse(e Entity) Response {
	attrs := e.Attributes
	if attrs == nil {
		attrs = map[string]string{} // selalu objek, bukan null
	}
	return Response{
		ID:          e.ID.Hex(),
		Name:        e.Name,
		TypeID:      e.TypeID.Hex(),
		Status:      e.Status,
		Description: e.Description,
		Latitude:    e.Location.Lat(),
		Longitude:   e.Location.Lng(),
		Attributes:  attrs,
		CreatedAt:   e.CreatedAt,
		UpdatedAt:   e.UpdatedAt,
	}
}
