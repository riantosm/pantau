// Package entity mengurus entitas berlokasi (kendaraan, sensor, gedung, ...).
package entity

import (
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// GeoPoint adalah format GeoJSON Point yang dipahami index 2dsphere.
// PERHATIAN: urutannya [longitude, latitude], kebalikan dari Leaflet.
type GeoPoint struct {
	Type        string    `bson:"type"`
	Coordinates []float64 `bson:"coordinates"`
}

// NewPoint membuat GeoPoint dari latitude dan longitude.
func NewPoint(lat, lng float64) GeoPoint {
	return GeoPoint{Type: "Point", Coordinates: []float64{lng, lat}}
}

// Lat dan Lng membaca balik koordinat dari GeoJSON.
func (p GeoPoint) Lat() float64 { return p.Coordinates[1] }
func (p GeoPoint) Lng() float64 { return p.Coordinates[0] }

// Entity adalah bentuk dokumen di koleksi entities.
type Entity struct {
	ID          bson.ObjectID     `bson:"_id,omitempty"`
	Name        string            `bson:"name"`
	TypeID      bson.ObjectID     `bson:"typeId"`
	Status      string            `bson:"status"`
	Description string            `bson:"description"`
	Location    GeoPoint          `bson:"location"`
	Attributes  map[string]string `bson:"attributes"`
	CreatedAt   time.Time         `bson:"createdAt"`
	UpdatedAt   time.Time         `bson:"updatedAt"`
}

// Status yang valid. Tetap enum karena tiap status punya arti dan bentuk marker sendiri.
const (
	StatusActive      = "active"
	StatusInactive    = "inactive"
	StatusMaintenance = "maintenance"
)

// ErrNotFound dikembalikan repository kalau entitas tidak ada.
var ErrNotFound = errors.New("entitas tidak ditemukan")
