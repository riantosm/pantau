package entity

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"

	"github.com/riantosm/pantau/backend/internal/httpx"
)

// Handler berisi handler HTTP untuk /entities.
type Handler struct {
	repo  Repository
	types TypeChecker
}

// NewHandler membuat handler. types dipakai untuk memastikan typeId ada.
func NewHandler(repo Repository, types TypeChecker) *Handler {
	return &Handler{repo: repo, types: types}
}

// Register memasang semua route di bawah grup yang diberikan (misalnya /api/v1).
func (h *Handler) Register(rg *gin.RouterGroup) {
	g := rg.Group("/entities")
	g.GET("", h.List)
	g.GET("/:id", h.Get)
	g.POST("", h.Create)
	g.PUT("/:id", h.Update)
	g.DELETE("/:id", h.Delete)
}

// List → GET /entities?typeId=&status=&q=
func (h *Handler) List(c *gin.Context) {
	var lf ListFilter
	_ = c.ShouldBindQuery(&lf) // semua field string, jadi bind query tidak bisa gagal
	lf.Q = strings.TrimSpace(lf.Q)
	if fields := httpx.Validate(lf); len(fields) > 0 {
		httpx.ValidationError(c, fields)
		return
	}

	f := Filter{Status: lf.Status, Q: lf.Q}
	if lf.TypeID != "" {
		id, _ := bson.ObjectIDFromHex(lf.TypeID) // sudah dicek oleh tag objectid
		f.TypeID = &id
	}

	entities, err := h.repo.List(c.Request.Context(), f)
	if err != nil {
		httpx.Internal(c, err)
		return
	}
	data := make([]Response, 0, len(entities))
	for _, e := range entities {
		data = append(data, toResponse(e))
	}
	c.JSON(http.StatusOK, gin.H{"data": data, "total": len(data)})
}

// Get → GET /entities/:id
func (h *Handler) Get(c *gin.Context) {
	id, ok := httpx.ParseID(c)
	if !ok {
		return
	}
	e, err := h.repo.Get(c.Request.Context(), id)
	if err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toResponse(e)})
}

// Create → POST /entities
func (h *Handler) Create(c *gin.Context) {
	in, ok := h.bindInput(c)
	if !ok {
		return
	}
	e := in.toModel()
	if err := h.repo.Create(c.Request.Context(), &e); err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": toResponse(e)})
}

// Update → PUT /entities/:id (mengganti seluruh field)
func (h *Handler) Update(c *gin.Context) {
	id, ok := httpx.ParseID(c)
	if !ok {
		return
	}
	in, ok := h.bindInput(c)
	if !ok {
		return
	}
	e, err := h.repo.Update(c.Request.Context(), id, in.toModel())
	if err != nil {
		fail(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toResponse(e)})
}

// Delete → DELETE /entities/:id
func (h *Handler) Delete(c *gin.Context) {
	id, ok := httpx.ParseID(c)
	if !ok {
		return
	}
	if err := h.repo.Delete(c.Request.Context(), id); err != nil {
		fail(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// bindInput: baca body → rapikan → validasi tag → validasi atribut → cek jenis ada.
// Kalau gagal, respons error sudah ditulis.
func (h *Handler) bindInput(c *gin.Context) (Input, bool) {
	var in Input
	if !httpx.BindJSON(c, &in) {
		return in, false
	}
	in.Normalize()

	fields := httpx.Validate(in)
	if msg := validateAttributes(in.Attributes); msg != "" {
		fields["attributes"] = msg
	}
	if len(fields) > 0 {
		httpx.ValidationError(c, fields)
		return in, false
	}

	// Validasi yang butuh database dilakukan terakhir, setelah semua cek murah lolos.
	if ok, err := h.typeExists(c.Request.Context(), in.TypeID); err != nil {
		httpx.Internal(c, err)
		return in, false
	} else if !ok {
		httpx.ValidationError(c, map[string]string{"typeId": "jenis tidak ditemukan"})
		return in, false
	}
	return in, true
}

func (h *Handler) typeExists(ctx context.Context, hex string) (bool, error) {
	id, err := bson.ObjectIDFromHex(hex)
	if err != nil {
		return false, nil
	}
	return h.types.Exists(ctx, id)
}

// fail menerjemahkan error repository ke respons HTTP.
func fail(c *gin.Context, err error) {
	if errors.Is(err, ErrNotFound) {
		httpx.NotFound(c, "Entitas")
		return
	}
	httpx.Internal(c, err)
}
