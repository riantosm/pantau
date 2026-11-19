// Entrypoint server: baca config → konek Mongo → buat index → jalankan HTTP.
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/riantosm/pantau/backend/internal/config"
	"github.com/riantosm/pantau/backend/internal/database"
	"github.com/riantosm/pantau/backend/internal/server"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	gin.SetMode(cfg.GinMode)

	// Batas waktu untuk konek + buat index saat start.
	startCtx, cancelStart := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancelStart()

	client, db, err := database.Connect(startCtx, cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = client.Disconnect(ctx)
	}()

	if err := database.EnsureIndexes(startCtx, db); err != nil {
		log.Fatalf("database: %v", err)
	}
	log.Printf("terhubung ke MongoDB, database %q", cfg.MongoDB)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           server.New(server.Deps{Client: client, DB: db, AllowedOrigins: cfg.AllowedOrigins}),
		ReadHeaderTimeout: 10 * time.Second,
	}

	// Jalankan server di goroutine supaya main bisa menunggu sinyal berhenti.
	go func() {
		log.Printf("server berjalan di :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("http: %v", err)
		}
	}()

	// Tunggu Ctrl+C (lokal) atau SIGTERM (Render saat redeploy).
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()
	<-ctx.Done()

	log.Println("mematikan server...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}
