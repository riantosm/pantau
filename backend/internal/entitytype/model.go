// Package entitytype mengurus master data "jenis entitas" (Kendaraan, Perangkat IoT, ...).
package entitytype

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// EntityType adalah bentuk dokumen di koleksi entity_types.
type EntityType struct {
	ID        bson.ObjectID `bson:"_id,omitempty"`
	Name      string        `bson:"name"`
	Icon      string        `bson:"icon"`
	CreatedAt time.Time     `bson:"createdAt"`
	UpdatedAt time.Time     `bson:"updatedAt"`
}

// Icons adalah daftar ikon yang dikenal frontend (dipetakan ke ikon lucide).
var Icons = []string{"truck", "cpu", "building", "pin", "box", "radio"}

// Error yang dikembalikan repository. Handler menerjemahkannya ke kode HTTP.
var (
	ErrNotFound  = errors.New("jenis tidak ditemukan")
	ErrNameTaken = errors.New("nama jenis sudah dipakai")
)
