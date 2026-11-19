package entitytype

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/riantosm/pantau/backend/internal/database"
)

// Repository adalah semua operasi data jenis yang dibutuhkan handler.
// Berupa interface supaya di test bisa diganti dengan versi palsu (in-memory).
type Repository interface {
	List(ctx context.Context) ([]EntityType, error)
	Get(ctx context.Context, id bson.ObjectID) (EntityType, error)
	Create(ctx context.Context, t *EntityType) error
	Update(ctx context.Context, id bson.ObjectID, name, icon string) (EntityType, error)
	Delete(ctx context.Context, id bson.ObjectID) error
}

// UsageCounter menghitung berapa entitas yang memakai suatu jenis.
// Diimplementasikan oleh repository entitas; didefinisikan di sini supaya
// package entitytype tidak perlu meng-import package entity (menghindari import siklus).
type UsageCounter interface {
	CountByType(ctx context.Context, typeID bson.ObjectID) (int64, error)
	CountGroupedByType(ctx context.Context) (map[bson.ObjectID]int64, error)
}

// caseInsensitive dipakai untuk urutan nama A–Z tanpa membedakan huruf besar/kecil.
var caseInsensitive = &options.Collation{Locale: "en", Strength: 2}

// MongoRepository adalah implementasi Repository dengan MongoDB.
type MongoRepository struct {
	coll *mongo.Collection
}

// NewMongoRepository membuat repository untuk koleksi entity_types.
func NewMongoRepository(db *mongo.Database) *MongoRepository {
	return &MongoRepository{coll: db.Collection(database.EntityTypesCollection)}
}

func (r *MongoRepository) List(ctx context.Context) ([]EntityType, error) {
	opts := options.Find().SetSort(bson.D{{Key: "name", Value: 1}}).SetCollation(caseInsensitive)
	cur, err := r.coll.Find(ctx, bson.D{}, opts)
	if err != nil {
		return nil, err
	}
	types := []EntityType{}
	if err := cur.All(ctx, &types); err != nil {
		return nil, err
	}
	return types, nil
}

func (r *MongoRepository) Get(ctx context.Context, id bson.ObjectID) (EntityType, error) {
	var t EntityType
	err := r.coll.FindOne(ctx, bson.D{{Key: "_id", Value: id}}).Decode(&t)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return t, ErrNotFound
	}
	return t, err
}

// Exists dipakai package entity untuk memastikan typeId benar-benar ada.
func (r *MongoRepository) Exists(ctx context.Context, id bson.ObjectID) (bool, error) {
	n, err := r.coll.CountDocuments(ctx, bson.D{{Key: "_id", Value: id}}, options.Count().SetLimit(1))
	return n > 0, err
}

func (r *MongoRepository) Create(ctx context.Context, t *EntityType) error {
	now := time.Now().UTC().Truncate(time.Millisecond) // Mongo menyimpan sampai milidetik
	t.ID = bson.NewObjectID()
	t.CreatedAt, t.UpdatedAt = now, now

	_, err := r.coll.InsertOne(ctx, t)
	if mongo.IsDuplicateKeyError(err) {
		return ErrNameTaken // ditolak oleh index unik name_unique_ci
	}
	return err
}

func (r *MongoRepository) Update(ctx context.Context, id bson.ObjectID, name, icon string) (EntityType, error) {
	update := bson.D{{Key: "$set", Value: bson.D{
		{Key: "name", Value: name},
		{Key: "icon", Value: icon},
		{Key: "updatedAt", Value: time.Now().UTC().Truncate(time.Millisecond)},
	}}}
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var t EntityType
	err := r.coll.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: id}}, update, opts).Decode(&t)
	switch {
	case errors.Is(err, mongo.ErrNoDocuments):
		return t, ErrNotFound
	case mongo.IsDuplicateKeyError(err):
		return t, ErrNameTaken
	}
	return t, err
}

func (r *MongoRepository) Delete(ctx context.Context, id bson.ObjectID) error {
	res, err := r.coll.DeleteOne(ctx, bson.D{{Key: "_id", Value: id}})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return ErrNotFound
	}
	return nil
}
