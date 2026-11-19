// Seed mengisi database dengan 3 jenis dan 12 entitas contoh (Bandung & Jakarta).
//
//	go run ./cmd/seed          # isi hanya kalau koleksi entities masih kosong
//	go run ./cmd/seed -reset   # hapus semua entitas & jenis, lalu isi ulang
package main

import (
	"context"
	"flag"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/riantosm/pantau/backend/internal/config"
	"github.com/riantosm/pantau/backend/internal/database"
	"github.com/riantosm/pantau/backend/internal/entity"
	"github.com/riantosm/pantau/backend/internal/entitytype"
)

type seedType struct{ key, name, icon string }

type seedEntity struct {
	name, typeKey, status, description string
	lat, lng                           float64
	attrs                              map[string]string
}

var types = []seedType{
	{"vehicle", "Kendaraan", "truck"},
	{"iot", "Perangkat IoT", "cpu"},
	{"facility", "Fasilitas", "building"},
}

var entities = []seedEntity{
	{"Truk Logistik 01", "vehicle", "active", "Rute gudang Cicendo ke kawasan Soekarno-Hatta, berangkat 08.00.", -6.9032, 107.5920,
		map[string]string{"Plat nomor": "D 8123 AB", "Pengemudi": "Andi Saputra", "Kecepatan": "42 km/jam"}},
	{"Sensor Suhu Gudang A", "iot", "active", "Sensor suhu & kelembapan ruang penyimpanan.", -6.9224, 107.6190,
		map[string]string{"Baterai": "82%", "Suhu": "27,4 °C"}},
	{"Gudang Utama Cicendo", "facility", "active", "Gudang transit barang masuk wilayah Bandung barat.", -6.9200, 107.5800,
		map[string]string{"Kapasitas": "1.200 m²", "PIC": "Rina Wulandari"}},
	{"Motor Kurir 07", "vehicle", "maintenance", "Sedang servis rutin di bengkel rekanan.", -6.8960, 107.6460,
		map[string]string{"Plat nomor": "D 4471 KC", "Servis": "Ganti kampas rem"}},
	{"Gateway LoRa Dago", "iot", "active", "Gateway untuk sensor area utara.", -6.8792, 107.6280,
		map[string]string{"Sinyal": "-87 dBm"}},
	{"Pos Servis Antapani", "facility", "maintenance", "Renovasi area parkir sampai akhir bulan.", -6.9152, 107.6760, nil},
	{"Sensor Banjir Citarum", "iot", "inactive", "Tidak mengirim data sejak 3 hari lalu.", -6.9608, 107.6040,
		map[string]string{"Baterai": "4%"}},
	{"Van Pengantar 03", "vehicle", "active", "", -6.9368, 107.6580,
		map[string]string{"Plat nomor": "D 1902 VN"}},
	{"Kantor Cabang Lengkong", "facility", "active", "Kantor operasional area selatan.", -6.9464, 107.6280,
		map[string]string{"Jam buka": "08.00–17.00"}},
	{"Pelacak GPS Kontainer", "iot", "inactive", "Perangkat cadangan, belum dipasang.", -6.9488, 107.5650, nil},
	{"Truk Logistik 02", "vehicle", "active", "Rute Jakarta - Bandung via tol Cipularang.", -6.2088, 106.8456,
		map[string]string{"Plat nomor": "B 9123 XY", "Pengemudi": "Budi Hartono"}},
	{"Gudang Transit Cakung", "facility", "active", "Gudang transit wilayah Jakarta timur.", -6.1789, 106.9417,
		map[string]string{"Kapasitas": "2.500 m²"}},
}

func main() {
	reset := flag.Bool("reset", false, "hapus semua entitas & jenis sebelum mengisi")
	flag.Parse()

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	client, db, err := database.Connect(ctx, cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer func() { _ = client.Disconnect(context.Background()) }()

	if err := database.EnsureIndexes(ctx, db); err != nil {
		log.Fatalf("database: %v", err)
	}

	entityColl := db.Collection(database.EntitiesCollection)
	typeColl := db.Collection(database.EntityTypesCollection)

	if *reset {
		mustDeleteAll(ctx, entityColl)
		mustDeleteAll(ctx, typeColl)
		log.Println("koleksi entities & entity_types dikosongkan")
	} else if n, err := entityColl.CountDocuments(ctx, bson.D{}); err != nil {
		log.Fatalf("hitung entitas: %v", err)
	} else if n > 0 {
		log.Printf("sudah ada %d entitas, seed dilewati (pakai -reset untuk mengisi ulang)", n)
		return
	}

	// Jenis: pakai yang sudah ada kalau namanya sama, supaya tidak bentrok dengan index unik.
	typeRepo := entitytype.NewMongoRepository(db)
	typeIDs := map[string]bson.ObjectID{}
	for _, st := range types {
		var existing entitytype.EntityType
		err := typeColl.FindOne(ctx, bson.D{{Key: "name", Value: st.name}}).Decode(&existing)
		if err == nil {
			typeIDs[st.key] = existing.ID
			continue
		}
		t := entitytype.EntityType{Name: st.name, Icon: st.icon}
		if err := typeRepo.Create(ctx, &t); err != nil {
			log.Fatalf("buat jenis %q: %v", st.name, err)
		}
		typeIDs[st.key] = t.ID
	}

	// Entitas: createdAt dibuat berurutan mundur supaya urutan daftar stabil.
	base := time.Now().UTC().Truncate(time.Millisecond)
	docs := make([]any, 0, len(entities))
	for i, se := range entities {
		ts := base.Add(-time.Duration(i) * time.Hour)
		attrs := se.attrs
		if attrs == nil {
			attrs = map[string]string{}
		}
		docs = append(docs, entity.Entity{
			ID:          bson.NewObjectID(),
			Name:        se.name,
			TypeID:      typeIDs[se.typeKey],
			Status:      se.status,
			Description: se.description,
			Location:    entity.NewPoint(se.lat, se.lng),
			Attributes:  attrs,
			CreatedAt:   ts,
			UpdatedAt:   ts,
		})
	}
	if _, err := entityColl.InsertMany(ctx, docs); err != nil {
		log.Fatalf("isi entitas: %v", err)
	}

	log.Printf("seed selesai: %d jenis, %d entitas di database %q", len(typeIDs), len(docs), cfg.MongoDB)
}

func mustDeleteAll(ctx context.Context, coll *mongo.Collection) {
	if _, err := coll.DeleteMany(ctx, bson.D{}); err != nil {
		log.Fatalf("kosongkan %s: %v", coll.Name(), err)
	}
}
