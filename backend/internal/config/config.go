// Package config membaca konfigurasi aplikasi dari environment variable.
package config

import (
	"errors"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config berisi semua pengaturan yang dibutuhkan server.
type Config struct {
	Port           string
	MongoURI       string
	MongoDB        string
	AllowedOrigins []string
	GinMode        string
}

// Load membaca file .env (kalau ada) lalu environment variable.
// Di Render tidak ada file .env: nilainya diisi lewat dashboard,
// jadi error dari godotenv.Load sengaja diabaikan.
func Load() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		Port:           getEnv("PORT", "8080"),
		MongoURI:       os.Getenv("MONGODB_URI"),
		MongoDB:        getEnv("MONGODB_DB", "pantau"),
		AllowedOrigins: splitCSV(getEnv("ALLOWED_ORIGINS", "http://localhost:5173")),
		GinMode:        getEnv("GIN_MODE", "debug"),
	}

	if cfg.MongoURI == "" {
		return cfg, errors.New("MONGODB_URI wajib diisi")
	}
	return cfg, nil
}

// getEnv mengembalikan nilai env, atau fallback kalau kosong.
func getEnv(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

// splitCSV mengubah "a, b,c" menjadi []string{"a", "b", "c"}.
func splitCSV(s string) []string {
	var out []string
	for _, part := range strings.Split(s, ",") {
		if p := strings.TrimSpace(part); p != "" {
			out = append(out, p)
		}
	}
	return out
}
