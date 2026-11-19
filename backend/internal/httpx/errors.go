// Package httpx berisi helper respons HTTP yang dipakai semua handler,
// supaya bentuk error selalu sama: {"error": {"code", "message", "fields"}}.
package httpx

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Kode error yang dikenal frontend.
const (
	CodeValidation = "VALIDATION_ERROR"
	CodeBadJSON    = "BAD_JSON"
	CodeInvalidID  = "INVALID_ID"
	CodeNotFound   = "NOT_FOUND"
	CodeNameTaken  = "NAME_TAKEN"
	CodeTypeInUse  = "TYPE_IN_USE"
	CodeInternal   = "INTERNAL"
)

// ErrorBody adalah isi dari key "error".
type ErrorBody struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
	Details map[string]any    `json:"details,omitempty"`
}

// ErrorResponse adalah bentuk JSON lengkap respons error.
type ErrorResponse struct {
	Error ErrorBody `json:"error"`
}

// Error menulis respons error lalu menghentikan handler berikutnya.
func Error(c *gin.Context, status int, code, message string, fields map[string]string) {
	c.AbortWithStatusJSON(status, ErrorResponse{
		Error: ErrorBody{Code: code, Message: message, Fields: fields},
	})
}

// ErrorWithDetails sama seperti Error, ditambah data pendukung (misalnya jumlah entitas).
func ErrorWithDetails(c *gin.Context, status int, code, message string, details map[string]any) {
	c.AbortWithStatusJSON(status, ErrorResponse{
		Error: ErrorBody{Code: code, Message: message, Details: details},
	})
}

// ValidationError membalas 400 dengan pesan per field.
func ValidationError(c *gin.Context, fields map[string]string) {
	Error(c, http.StatusBadRequest, CodeValidation, "Input tidak valid", fields)
}

// NotFound membalas 404. what = "Entitas" atau "Jenis".
func NotFound(c *gin.Context, what string) {
	Error(c, http.StatusNotFound, CodeNotFound, what+" tidak ditemukan", nil)
}

// Internal mencatat error asli di log server, tapi klien hanya menerima pesan umum.
func Internal(c *gin.Context, err error) {
	log.Printf("internal error %s %s: %v", c.Request.Method, c.Request.URL.Path, err)
	Error(c, http.StatusInternalServerError, CodeInternal, "Terjadi kesalahan di server", nil)
}
