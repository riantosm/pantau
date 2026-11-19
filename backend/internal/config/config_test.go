package config

import (
	"reflect"
	"testing"
)

func TestSplitCSV(t *testing.T) {
	tests := []struct {
		in   string
		want []string
	}{
		{"http://localhost:5173", []string{"http://localhost:5173"}},
		// Spasi dan garis miring di akhir (salah ketik umum di dashboard) dirapikan.
		{" http://localhost:5173 , https://pantau-map.netlify.app/ ", []string{"http://localhost:5173", "https://pantau-map.netlify.app"}},
		{"a,,b,", []string{"a", "b"}},
		{"", nil},
	}
	for _, tc := range tests {
		if got := splitCSV(tc.in); !reflect.DeepEqual(got, tc.want) {
			t.Errorf("splitCSV(%q) = %v, mau %v", tc.in, got, tc.want)
		}
	}
}
