package httpx

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// maxBodyBytes membatasi ukuran body supaya server tidak bisa dibanjiri data.
const maxBodyBytes = 1 << 20 // 1 MB

// BindJSON membaca body JSON ke dst. Kalau gagal, respons error sudah ditulis
// dan fungsi mengembalikan false, jadi handler cukup `return`.
//
// Body yang rusak → 400 BAD_JSON.
// Tipe data salah (misalnya latitude berisi teks) → 400 VALIDATION_ERROR di field itu,
// supaya frontend bisa menampilkan pesannya di input yang tepat.
func BindJSON(c *gin.Context, dst any) bool {
	dec := json.NewDecoder(http.MaxBytesReader(c.Writer, c.Request.Body, maxBodyBytes))
	err := dec.Decode(dst)
	if err == nil {
		return true
	}

	var typeErr *json.UnmarshalTypeError
	var tooBig *http.MaxBytesError
	switch {
	case errors.As(err, &typeErr) && typeErr.Field != "":
		ValidationError(c, map[string]string{typeErr.Field: "tipe data salah"})
	case errors.As(err, &tooBig):
		Error(c, http.StatusRequestEntityTooLarge, CodeBadJSON, "Body terlalu besar (maks. 1 MB)", nil)
	case errors.Is(err, io.EOF):
		Error(c, http.StatusBadRequest, CodeBadJSON, "Body kosong, kirim JSON", nil)
	default:
		Error(c, http.StatusBadRequest, CodeBadJSON, "Body bukan JSON yang valid", nil)
	}
	return false
}

// ParseID membaca path param :id sebagai ObjectID. Kalau tidak valid,
// respons 400 INVALID_ID sudah ditulis dan ok bernilai false.
func ParseID(c *gin.Context) (id bson.ObjectID, ok bool) {
	id, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		Error(c, http.StatusBadRequest, CodeInvalidID, "ID tidak valid", nil)
		return id, false
	}
	return id, true
}
