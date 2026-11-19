// Package httpx berisi helper respons HTTP yang dipakai semua handler,
// supaya bentuk error selalu sama: {"error": {"code", "message", "fields"}}.
package httpx

import "github.com/gin-gonic/gin"

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
