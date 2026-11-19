package entitytype

import (
	"strings"
	"time"
)

// Input adalah body POST/PUT /entity-types.
// Tag `validate` dibaca oleh httpx.Validate. Daftar oneof harus sama dengan Icons.
type Input struct {
	Name string `json:"name" validate:"required,min=2,max=50"`
	Icon string `json:"icon" validate:"required,oneof=truck cpu building pin box radio"`
}

// Normalize merapikan input sebelum divalidasi (spasi di awal/akhir dibuang).
func (in *Input) Normalize() {
	in.Name = strings.TrimSpace(in.Name)
	in.Icon = strings.TrimSpace(in.Icon)
}

// Response adalah bentuk jenis yang dikirim ke frontend.
type Response struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Icon        string    `json:"icon"`
	EntityCount int64     `json:"entityCount"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// toResponse mengubah dokumen DB menjadi respons API.
func toResponse(t EntityType, count int64) Response {
	return Response{
		ID:          t.ID.Hex(),
		Name:        t.Name,
		Icon:        t.Icon,
		EntityCount: count,
		CreatedAt:   t.CreatedAt,
		UpdatedAt:   t.UpdatedAt,
	}
}
