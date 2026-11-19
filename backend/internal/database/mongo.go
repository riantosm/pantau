// Package database mengurus koneksi MongoDB dan pembuatan index.
package database

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

// Nama koleksi dipakai bersama oleh package lain.
const (
	EntitiesCollection    = "entities"
	EntityTypesCollection = "entity_types"
)

// Connect membuka koneksi lalu memastikan server benar-benar bisa dijangkau (ping).
func Connect(ctx context.Context, uri, dbName string) (*mongo.Client, *mongo.Database, error) {
	opts := options.Client().
		ApplyURI(uri).
		SetServerSelectionTimeout(10 * time.Second)

	client, err := mongo.Connect(opts)
	if err != nil {
		return nil, nil, fmt.Errorf("membuat client mongo: %w", err)
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		_ = client.Disconnect(context.Background())
		return nil, nil, fmt.Errorf("ping mongo: %w", err)
	}

	return client, client.Database(dbName), nil
}

// EnsureIndexes membuat index yang dibutuhkan. Aman dipanggil berulang kali:
// kalau index dengan nama dan definisi yang sama sudah ada, Mongo tidak mengubah apa pun.
func EnsureIndexes(ctx context.Context, db *mongo.Database) error {
	_, err := db.Collection(EntitiesCollection).Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			// Index geospasial untuk field GeoJSON Point.
			Keys:    bson.D{{Key: "location", Value: "2dsphere"}},
			Options: options.Index().SetName("location_2dsphere"),
		},
		{
			// Mempercepat filter daftar dan cek "jenis masih dipakai".
			Keys:    bson.D{{Key: "typeId", Value: 1}, {Key: "status", Value: 1}},
			Options: options.Index().SetName("typeId_status"),
		},
	})
	if err != nil {
		return fmt.Errorf("index %s: %w", EntitiesCollection, err)
	}

	// Nama jenis unik tanpa membedakan huruf besar/kecil ("IoT" == "iot").
	// Collation strength 2 = abaikan perbedaan huruf besar/kecil.
	_, err = db.Collection(EntityTypesCollection).Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "name", Value: 1}},
		Options: options.Index().
			SetName("name_unique_ci").
			SetUnique(true).
			SetCollation(&options.Collation{Locale: "en", Strength: 2}),
	})
	if err != nil {
		return fmt.Errorf("index %s: %w", EntityTypesCollection, err)
	}

	return nil
}
