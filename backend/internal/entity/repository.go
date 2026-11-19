package entity

import (
	"context"
	"errors"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/riantosm/pantau/backend/internal/database"
)

// Filter adalah filter daftar yang sudah divalidasi dan dikonversi.
type Filter struct {
	TypeID *bson.ObjectID // nil = semua jenis
	Status string         // "" = semua status
	Q      string         // cari di nama, tanpa beda huruf besar/kecil
}

// Repository adalah semua operasi data entitas yang dibutuhkan handler.
type Repository interface {
	List(ctx context.Context, f Filter) ([]Entity, error)
	Get(ctx context.Context, id bson.ObjectID) (Entity, error)
	Create(ctx context.Context, e *Entity) error
	Update(ctx context.Context, id bson.ObjectID, e Entity) (Entity, error)
	Delete(ctx context.Context, id bson.ObjectID) error
}

// TypeChecker memastikan typeId benar-benar ada di entity_types.
// Diimplementasikan oleh entitytype.MongoRepository (lihat method Exists).
type TypeChecker interface {
	Exists(ctx context.Context, id bson.ObjectID) (bool, error)
}

// MongoRepository adalah implementasi Repository dengan MongoDB.
// Ia juga memenuhi entitytype.UsageCounter (CountByType, CountGroupedByType).
type MongoRepository struct {
	coll *mongo.Collection
}

// NewMongoRepository membuat repository untuk koleksi entities.
func NewMongoRepository(db *mongo.Database) *MongoRepository {
	return &MongoRepository{coll: db.Collection(database.EntitiesCollection)}
}

func (r *MongoRepository) List(ctx context.Context, f Filter) ([]Entity, error) {
	query := bson.D{}
	if f.TypeID != nil {
		query = append(query, bson.E{Key: "typeId", Value: *f.TypeID})
	}
	if f.Status != "" {
		query = append(query, bson.E{Key: "status", Value: f.Status})
	}
	if f.Q != "" {
		// QuoteMeta: karakter seperti "." atau "(" dicari apa adanya, bukan sebagai regex.
		query = append(query, bson.E{Key: "name", Value: bson.Regex{Pattern: regexp.QuoteMeta(f.Q), Options: "i"}})
	}

	// Terbaru di atas, supaya entitas yang baru ditambah langsung terlihat.
	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}, {Key: "_id", Value: -1}})
	cur, err := r.coll.Find(ctx, query, opts)
	if err != nil {
		return nil, err
	}
	entities := []Entity{}
	if err := cur.All(ctx, &entities); err != nil {
		return nil, err
	}
	return entities, nil
}

func (r *MongoRepository) Get(ctx context.Context, id bson.ObjectID) (Entity, error) {
	var e Entity
	err := r.coll.FindOne(ctx, bson.D{{Key: "_id", Value: id}}).Decode(&e)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return e, ErrNotFound
	}
	return e, err
}

func (r *MongoRepository) Create(ctx context.Context, e *Entity) error {
	now := time.Now().UTC().Truncate(time.Millisecond)
	e.ID = bson.NewObjectID()
	e.CreatedAt, e.UpdatedAt = now, now
	_, err := r.coll.InsertOne(ctx, e)
	return err
}

// Update mengganti semua field yang bisa diubah. createdAt tidak disentuh.
func (r *MongoRepository) Update(ctx context.Context, id bson.ObjectID, e Entity) (Entity, error) {
	update := bson.D{{Key: "$set", Value: bson.D{
		{Key: "name", Value: e.Name},
		{Key: "typeId", Value: e.TypeID},
		{Key: "status", Value: e.Status},
		{Key: "description", Value: e.Description},
		{Key: "location", Value: e.Location},
		{Key: "attributes", Value: e.Attributes},
		{Key: "updatedAt", Value: time.Now().UTC().Truncate(time.Millisecond)},
	}}}
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)

	var out Entity
	err := r.coll.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: id}}, update, opts).Decode(&out)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return out, ErrNotFound
	}
	return out, err
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

// CountByType menghitung entitas dengan typeId tertentu.
func (r *MongoRepository) CountByType(ctx context.Context, typeID bson.ObjectID) (int64, error) {
	return r.coll.CountDocuments(ctx, bson.D{{Key: "typeId", Value: typeID}})
}

// CountGroupedByType menghitung entitas per jenis dalam satu query (aggregate $group).
func (r *MongoRepository) CountGroupedByType(ctx context.Context) (map[bson.ObjectID]int64, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$typeId"},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
	}
	cur, err := r.coll.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}

	var rows []struct {
		ID    bson.ObjectID `bson:"_id"`
		Count int64         `bson:"count"`
	}
	if err := cur.All(ctx, &rows); err != nil {
		return nil, err
	}

	counts := make(map[bson.ObjectID]int64, len(rows))
	for _, row := range rows {
		counts[row.ID] = row.Count
	}
	return counts, nil
}
