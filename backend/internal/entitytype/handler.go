package entitytype

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/riantosm/pantau/backend/internal/httpx"
)

// Handler berisi handler HTTP untuk /entity-types.
type Handler struct {
	repo  Repository
	usage UsageCounter
}

// NewHandler membuat handler. usage dipakai untuk entityCount dan cek "masih dipakai".
func NewHandler(repo Repository, usage UsageCounter) *Handler {
	return &Handler{repo: repo, usage: usage}
}

// Register memasang semua route di bawah grup yang diberikan (misalnya /api/v1).
func (h *Handler) Register(rg *gin.RouterGroup) {
	g := rg.Group("/entity-types")
	g.GET("", h.List)
	g.GET("/:id", h.Get)
	g.POST("", h.Create)
	g.PUT("/:id", h.Update)
	g.DELETE("/:id", h.Delete)
}

// List → GET /entity-types. Setiap jenis disertai entityCount.
func (h *Handler) List(c *gin.Context) {
	ctx := c.Request.Context()

	types, err := h.repo.List(ctx)
	if err != nil {
		httpx.Internal(c, err)
		return
	}
	counts, err := h.usage.CountGroupedByType(ctx)
	if err != nil {
		httpx.Internal(c, err)
		return
	}

	data := make([]Response, 0, len(types))
	for _, t := range types {
		data = append(data, toResponse(t, counts[t.ID]))
	}
	c.JSON(http.StatusOK, gin.H{"data": data, "total": len(data)})
}

// Get → GET /entity-types/:id
func (h *Handler) Get(c *gin.Context) {
	id, ok := httpx.ParseID(c)
	if !ok {
		return
	}
	ctx := c.Request.Context()

	t, err := h.repo.Get(ctx, id)
	if err != nil {
		h.fail(c, err)
		return
	}
	count, err := h.usage.CountByType(ctx, id)
	if err != nil {
		httpx.Internal(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toResponse(t, count)})
}

// Create → POST /entity-types
func (h *Handler) Create(c *gin.Context) {
	in, ok := bindInput(c)
	if !ok {
		return
	}

	t := EntityType{Name: in.Name, Icon: in.Icon}
	if err := h.repo.Create(c.Request.Context(), &t); err != nil {
		h.fail(c, err)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": toResponse(t, 0)})
}

// Update → PUT /entity-types/:id
func (h *Handler) Update(c *gin.Context) {
	id, ok := httpx.ParseID(c)
	if !ok {
		return
	}
	in, ok := bindInput(c)
	if !ok {
		return
	}
	ctx := c.Request.Context()

	t, err := h.repo.Update(ctx, id, in.Name, in.Icon)
	if err != nil {
		h.fail(c, err)
		return
	}
	count, err := h.usage.CountByType(ctx, id)
	if err != nil {
		httpx.Internal(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": toResponse(t, count)})
}

// Delete → DELETE /entity-types/:id. Ditolak (409) kalau masih ada entitas yang memakainya.
func (h *Handler) Delete(c *gin.Context) {
	id, ok := httpx.ParseID(c)
	if !ok {
		return
	}
	ctx := c.Request.Context()

	// Cek dulu jenisnya ada, supaya jenis yang tidak ada selalu 404 (bukan 409).
	if _, err := h.repo.Get(ctx, id); err != nil {
		h.fail(c, err)
		return
	}

	count, err := h.usage.CountByType(ctx, id)
	if err != nil {
		httpx.Internal(c, err)
		return
	}
	if count > 0 {
		httpx.ErrorWithDetails(c, http.StatusConflict, httpx.CodeTypeInUse,
			"Jenis masih dipakai entitas, pindahkan atau hapus entitasnya dulu",
			map[string]any{"entityCount": count})
		return
	}

	if err := h.repo.Delete(ctx, id); err != nil {
		h.fail(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// bindInput membaca body, merapikan, lalu memvalidasi. Kalau gagal, respons sudah ditulis.
func bindInput(c *gin.Context) (Input, bool) {
	var in Input
	if !httpx.BindJSON(c, &in) {
		return in, false
	}
	in.Normalize()
	if fields := httpx.Validate(in); len(fields) > 0 {
		httpx.ValidationError(c, fields)
		return in, false
	}
	return in, true
}

// fail menerjemahkan error repository ke respons HTTP.
func (h *Handler) fail(c *gin.Context, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		httpx.NotFound(c, "Jenis")
	case errors.Is(err, ErrNameTaken):
		httpx.Error(c, http.StatusConflict, httpx.CodeNameTaken, "Nama jenis sudah dipakai",
			map[string]string{"name": "nama sudah dipakai jenis lain"})
	default:
		httpx.Internal(c, err)
	}
}
