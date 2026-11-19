package httpx

import (
	"errors"
	"fmt"
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// validate adalah satu instance validator untuk seluruh aplikasi (aman dipakai bersamaan).
var validate = newValidator()

func newValidator() *validator.Validate {
	v := validator.New(validator.WithRequiredStructEnabled())

	// Pakai nama dari tag json ("latitude"), bukan nama field Go ("Latitude"),
	// supaya key di "fields" sama dengan key yang dikirim frontend.
	v.RegisterTagNameFunc(func(f reflect.StructField) string {
		name := strings.SplitN(f.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})

	// Tag kustom.
	_ = v.RegisterValidation("objectid", func(fl validator.FieldLevel) bool {
		_, err := bson.ObjectIDFromHex(fl.Field().String())
		return err == nil
	})
	_ = v.RegisterValidation("lat", func(fl validator.FieldLevel) bool {
		f := fl.Field().Float()
		return f >= -90 && f <= 90
	})
	_ = v.RegisterValidation("lng", func(fl validator.FieldLevel) bool {
		f := fl.Field().Float()
		return f >= -180 && f <= 180
	})

	return v
}

// Validate menjalankan tag `validate:"..."` pada struct s.
// Hasilnya map field → pesan berbahasa Indonesia. Map kosong berarti valid.
func Validate(s any) map[string]string {
	fields := map[string]string{}

	err := validate.Struct(s)
	if err == nil {
		return fields
	}

	var verrs validator.ValidationErrors
	if !errors.As(err, &verrs) {
		// Hanya terjadi kalau s bukan struct: kesalahan programmer, bukan input.
		panic(err)
	}
	for _, fe := range verrs {
		fields[fe.Field()] = message(fe)
	}
	return fields
}

// message menerjemahkan satu error validator menjadi kalimat untuk pengguna.
func message(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "wajib diisi"
	case "min":
		return fmt.Sprintf("minimal %s karakter", fe.Param())
	case "max":
		return fmt.Sprintf("maksimal %s karakter", fe.Param())
	case "oneof":
		return "harus salah satu dari: " + strings.ReplaceAll(fe.Param(), " ", ", ")
	case "objectid":
		return "ID tidak valid"
	case "lat":
		return "harus antara -90 dan 90"
	case "lng":
		return "harus antara -180 dan 180"
	default:
		return "tidak valid"
	}
}
