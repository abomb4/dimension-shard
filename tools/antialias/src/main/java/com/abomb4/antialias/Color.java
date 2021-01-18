//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.abomb4.antialias;


public class Color {
    public static final Color white = new Color(1.0F, 1.0F, 1.0F, 1.0F);
    public static final Color lightGray = new Color(-1077952513);
    public static final Color gray = new Color(2139062271);
    public static final Color darkGray = new Color(1061109759);
    public static final Color black = new Color(0.0F, 0.0F, 0.0F, 1.0F);
    public static final Color clear = new Color(0.0F, 0.0F, 0.0F, 0.0F);
    public static final float whiteFloatBits;
    public static final float clearFloatBits;
    public static final float blackFloatBits;
    public static final Color blue;
    public static final Color navy;
    public static final Color royal;
    public static final Color slate;
    public static final Color sky;
    public static final Color cyan;
    public static final Color teal;
    public static final Color green;
    public static final Color acid;
    public static final Color lime;
    public static final Color forest;
    public static final Color olive;
    public static final Color yellow;
    public static final Color gold;
    public static final Color goldenrod;
    public static final Color orange;
    public static final Color brown;
    public static final Color tan;
    public static final Color brick;
    public static final Color red;
    public static final Color scarlet;
    public static final Color crimson;
    public static final Color coral;
    public static final Color salmon;
    public static final Color pink;
    public static final Color magenta;
    public static final Color purple;
    public static final Color violet;
    public static final Color maroon;
    private static final float[] tmpHSV;
    public float r;
    public float g;
    public float b;
    public float a;

    public Color() {
    }

    public Color(int rgba8888) {
        this.rgba8888(rgba8888);
    }

    public Color(float r, float g, float b, float a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.clamp();
    }

    public Color(float r, float g, float b) {
        this(r, g, b, 1.0F);
    }

    public Color(Color color) {
        this.set(color);
    }

    public static Color valueOf(String hex) {
        return valueOf(new Color(), hex);
    }

    public static Color valueOf(Color color, String hex) {
        int offset = hex.charAt(0) == '#' ? 1 : 0;
        int r = parseHex(hex, offset, offset + 2);
        int g = parseHex(hex, offset + 2, offset + 4);
        int b = parseHex(hex, offset + 4, offset + 6);
        int a = hex.length() - offset != 8 ? 255 : parseHex(hex, offset + 6, offset + 8);
        return color.set((float) r / 255.0F, (float) g / 255.0F, (float) b / 255.0F, (float) a / 255.0F);
    }

    private static int parseHex(String string, int from, int to) {
        int total = 0;

        for (int i = from; i < to; ++i) {
            char c = string.charAt(i);
            total += Character.digit(c, 16) * (i == from ? 16 : 1);
        }

        return total;
    }

    public static float toFloatBits(int r, int g, int b, int a) {
        int color = a << 24 | b << 16 | g << 8 | r;
        return intToFloatColor(color);
    }

    public static float toFloatBits(float r, float g, float b, float a) {
        int color = (int) (255.0F * a) << 24 | (int) (255.0F * b) << 16 | (int) (255.0F * g) << 8 | (int) (255.0F * r);
        return intToFloatColor(color);
    }

    public static int toIntBits(int r, int g, int b, int a) {
        return a << 24 | b << 16 | g << 8 | r;
    }

    public static int alpha(float alpha) {
        return (int) (alpha * 255.0F);
    }

    public static int luminanceAlpha(float luminance, float alpha) {
        return (int) (luminance * 255.0F) << 8 | (int) (alpha * 255.0F);
    }

    public static int rgb565(float r, float g, float b) {
        return (int) (r * 31.0F) << 11 | (int) (g * 63.0F) << 5 | (int) (b * 31.0F);
    }

    public static int rgba4444(float r, float g, float b, float a) {
        return (int) (r * 15.0F) << 12 | (int) (g * 15.0F) << 8 | (int) (b * 15.0F) << 4 | (int) (a * 15.0F);
    }

    public static int rgb888(float r, float g, float b) {
        return (int) (r * 255.0F) << 16 | (int) (g * 255.0F) << 8 | (int) (b * 255.0F);
    }

    public static int rgba8888(float r, float g, float b, float a) {
        return (int) (r * 255.0F) << 24 | (int) (g * 255.0F) << 16 | (int) (b * 255.0F) << 8 | (int) (a * 255.0F);
    }

    public static int argb8888(float a, float r, float g, float b) {
        return (int) (a * 255.0F) << 24 | (int) (r * 255.0F) << 16 | (int) (g * 255.0F) << 8 | (int) (b * 255.0F);
    }

    public int rgb565() {
        return (int) (this.r * 31.0F) << 11 | (int) (this.g * 63.0F) << 5 | (int) (this.b * 31.0F);
    }

    public int rgba4444() {
        return (int) (this.r * 15.0F) << 12 | (int) (this.g * 15.0F) << 8 | (int) (this.b * 15.0F) << 4 | (int) (this.a * 15.0F);
    }

    public int rgb888() {
        return (int) (this.r * 255.0F) << 16 | (int) (this.g * 255.0F) << 8 | (int) (this.b * 255.0F);
    }

    public int rgba8888() {
        return (int) (this.r * 255.0F) << 24 | (int) (this.g * 255.0F) << 16 | (int) (this.b * 255.0F) << 8 | (int) (this.a * 255.0F);
    }

    public int argb8888() {
        return (int) (this.a * 255.0F) << 24 | (int) (this.r * 255.0F) << 16 | (int) (this.g * 255.0F) << 8 | (int) (this.b * 255.0F);
    }

    public Color rgb565(int value) {
        this.r = (float) ((value & '\uf800') >>> 11) / 31.0F;
        this.g = (float) ((value & 2016) >>> 5) / 63.0F;
        this.b = (float) (value & 31) / 31.0F;
        return this;
    }

    public Color rgba4444(int value) {
        this.r = (float) ((value & '\uf000') >>> 12) / 15.0F;
        this.g = (float) ((value & 3840) >>> 8) / 15.0F;
        this.b = (float) ((value & 240) >>> 4) / 15.0F;
        this.a = (float) (value & 15) / 15.0F;
        return this;
    }

    public Color rgb888(int value) {
        this.r = (float) ((value & 16711680) >>> 16) / 255.0F;
        this.g = (float) ((value & '\uff00') >>> 8) / 255.0F;
        this.b = (float) (value & 255) / 255.0F;
        return this;
    }

    public Color rgba8888(int value) {
        this.r = (float) ((value & -16777216) >>> 24) / 255.0F;
        this.g = (float) ((value & 16711680) >>> 16) / 255.0F;
        this.b = (float) ((value & '\uff00') >>> 8) / 255.0F;
        this.a = (float) (value & 255) / 255.0F;
        return this;
    }

    public Color argb8888(int value) {
        this.a = (float) ((value & -16777216) >>> 24) / 255.0F;
        this.r = (float) ((value & 16711680) >>> 16) / 255.0F;
        this.g = (float) ((value & '\uff00') >>> 8) / 255.0F;
        this.b = (float) (value & 255) / 255.0F;
        return this;
    }

    public Color abgr8888(float value) {
        int c = floatToIntColor(value);
        this.a = (float) ((c & -16777216) >>> 24) / 255.0F;
        this.b = (float) ((c & 16711680) >>> 16) / 255.0F;
        this.g = (float) ((c & '\uff00') >>> 8) / 255.0F;
        this.r = (float) (c & 255) / 255.0F;
        return this;
    }

    public static Color grays(float value) {
        return new Color(value, value, value);
    }

    public static Color rgb(int r, int g, int b) {
        return new Color((float) r / 255.0F, (float) g / 255.0F, (float) b / 255.0F);
    }

    public static int floatToIntColor(float value) {
        int intBits = Float.floatToRawIntBits(value);
        intBits |= (int) ((float) (intBits >>> 24) * 1.003937F) << 24;
        return intBits;
    }

    public static float intToFloatColor(int value) {
        return Float.intBitsToFloat(value & -16777217);
    }

    public Color rand() {
        return this.set(Mathf.random(), Mathf.random(), Mathf.random(), 1.0F);
    }

    public Color randHue() {
        this.fromHsv(Mathf.random(360.0F), 1.0F, 1.0F);
        this.a = 1.0F;
        return this;
    }

    public float diff(Color other) {
        return Math.abs(this.hue() - other.hue()) / 360.0F + Math.abs(this.value() - other.value()) + Math.abs(this.saturation() - other.saturation());
    }

    public int rgba() {
        return this.rgba8888();
    }

    public Color set(Color color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;
        return this;
    }

    public Color mul(Color color) {
        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;
        this.a *= color.a;
        return this.clamp();
    }

    public Color mul(float value) {
        this.r *= value;
        this.g *= value;
        this.b *= value;
        return this.clamp();
    }

    public Color mula(float value) {
        this.r *= value;
        this.g *= value;
        this.b *= value;
        this.a *= value;
        return this.clamp();
    }

    public Color add(Color color) {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b;
        return this.clamp();
    }

    public Color sub(Color color) {
        this.r -= color.r;
        this.g -= color.g;
        this.b -= color.b;
        return this.clamp();
    }

    public Color clamp() {
        if (this.r < 0.0F) {
            this.r = 0.0F;
        } else if (this.r > 1.0F) {
            this.r = 1.0F;
        }

        if (this.g < 0.0F) {
            this.g = 0.0F;
        } else if (this.g > 1.0F) {
            this.g = 1.0F;
        }

        if (this.b < 0.0F) {
            this.b = 0.0F;
        } else if (this.b > 1.0F) {
            this.b = 1.0F;
        }

        if (this.a < 0.0F) {
            this.a = 0.0F;
        } else if (this.a > 1.0F) {
            this.a = 1.0F;
        }

        return this;
    }

    public Color set(float r, float g, float b, float a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        return this.clamp();
    }

    public Color set(float r, float g, float b) {
        this.r = r;
        this.g = g;
        this.b = b;
        return this.clamp();
    }

    public Color set(int rgba) {
        return this.rgba8888(rgba);
    }

    public float sum() {
        return this.r + this.g + this.b;
    }

    public Color add(float r, float g, float b, float a) {
        this.r += r;
        this.g += g;
        this.b += b;
        this.a += a;
        return this.clamp();
    }

    public Color add(float r, float g, float b) {
        this.r += r;
        this.g += g;
        this.b += b;
        return this.clamp();
    }

    public Color sub(float r, float g, float b, float a) {
        this.r -= r;
        this.g -= g;
        this.b -= b;
        this.a -= a;
        return this.clamp();
    }

    public Color sub(float r, float g, float b) {
        this.r -= r;
        this.g -= g;
        this.b -= b;
        return this.clamp();
    }

    public Color inv() {
        this.r = 1.0F - this.r;
        this.g = 1.0F - this.g;
        this.b = 1.0F - this.b;
        return this;
    }

    public Color r(float r) {
        this.r = r;
        return this;
    }

    public Color g(float g) {
        this.g = g;
        return this;
    }

    public Color b(float b) {
        this.b = b;
        return this;
    }

    public Color a(float a) {
        this.a = a;
        return this;
    }

    public Color mul(float r, float g, float b, float a) {
        this.r *= r;
        this.g *= g;
        this.b *= b;
        this.a *= a;
        return this.clamp();
    }

    public Color lerp(Color target, float t) {
        this.r += t * (target.r - this.r);
        this.g += t * (target.g - this.g);
        this.b += t * (target.b - this.b);
        this.a += t * (target.a - this.a);
        return this.clamp();
    }

    public Color lerp(float r, float g, float b, float a, float t) {
        this.r += t * (r - this.r);
        this.g += t * (g - this.g);
        this.b += t * (b - this.b);
        this.a += t * (a - this.a);
        return this.clamp();
    }

    public Color premultiplyAlpha() {
        this.r *= this.a;
        this.g *= this.a;
        this.b *= this.a;
        return this;
    }

    public Color write(Color to) {
        return to.set(this);
    }

    public float hue() {
        this.toHsv(tmpHSV);
        return tmpHSV[0];
    }

    public float saturation() {
        this.toHsv(tmpHSV);
        return tmpHSV[1];
    }

    public float value() {
        this.toHsv(tmpHSV);
        return tmpHSV[2];
    }

    public Color shiftHue(float amount) {
        this.toHsv(tmpHSV);
        float[] var10000 = tmpHSV;
        var10000[0] += amount;
        this.fromHsv(tmpHSV);
        return this;
    }

    public Color shiftSaturation(float amount) {
        this.toHsv(tmpHSV);
        float[] var10000 = tmpHSV;
        var10000[1] += amount;
        this.fromHsv(tmpHSV);
        return this;
    }

    public Color shiftValue(float amount) {
        this.toHsv(tmpHSV);
        float[] var10000 = tmpHSV;
        var10000[2] += amount;
        this.fromHsv(tmpHSV);
        return this;
    }

    public boolean equals(Object o) {
        if (this == o) {
            return true;
        } else if (o != null && this.getClass() == o.getClass()) {
            Color color = (Color) o;
            return this.toIntBits() == color.toIntBits();
        } else {
            return false;
        }
    }

    public int hashCode() {
        int result = this.r != 0.0F ? Float.floatToIntBits(this.r) : 0;
        result = 31 * result + (this.g != 0.0F ? Float.floatToIntBits(this.g) : 0);
        result = 31 * result + (this.b != 0.0F ? Float.floatToIntBits(this.b) : 0);
        result = 31 * result + (this.a != 0.0F ? Float.floatToIntBits(this.a) : 0);
        return result;
    }

    public float toFloatBits() {
        int color = (int) (255.0F * this.a) << 24 | (int) (255.0F * this.b) << 16 | (int) (255.0F * this.g) << 8 | (int) (255.0F * this.r);
        return intToFloatColor(color);
    }

    public int toIntBits() {
        return (int) (255.0F * this.a) << 24 | (int) (255.0F * this.b) << 16 | (int) (255.0F * this.g) << 8 | (int) (255.0F * this.r);
    }

    public String toString() {
        StringBuilder value = new StringBuilder();
        this.toString(value);
        return value.toString();
    }

    public void toString(StringBuilder builder) {
        builder.append(Integer.toHexString((int) (255.0F * this.r) << 24 | (int) (255.0F * this.g) << 16 | (int) (255.0F * this.b) << 8 | (int) (255.0F * this.a)));

        while (builder.length() < 8) {
            builder.insert(0, "0");
        }

    }

    public Color fromHsv(float h, float s, float v) {
        float x = (h / 60.0F + 6.0F) % 6.0F;
        int i = (int) x;
        float f = x - (float) i;
        float p = v * (1.0F - s);
        float q = v * (1.0F - s * f);
        float t = v * (1.0F - s * (1.0F - f));
        switch (i) {
            case 0:
                this.r = v;
                this.g = t;
                this.b = p;
                break;
            case 1:
                this.r = q;
                this.g = v;
                this.b = p;
                break;
            case 2:
                this.r = p;
                this.g = v;
                this.b = t;
                break;
            case 3:
                this.r = p;
                this.g = q;
                this.b = v;
                break;
            case 4:
                this.r = t;
                this.g = p;
                this.b = v;
                break;
            default:
                this.r = v;
                this.g = p;
                this.b = q;
        }

        return this.clamp();
    }

    public Color fromHsv(float[] hsv) {
        return this.fromHsv(hsv[0], hsv[1], hsv[2]);
    }

    public float[] toHsv(float[] hsv) {
        float max = Math.max(Math.max(this.r, this.g), this.b);
        float min = Math.min(Math.min(this.r, this.g), this.b);
        float range = max - min;
        if (range == 0.0F) {
            hsv[0] = 0.0F;
        } else if (max == this.r) {
            hsv[0] = (60.0F * (this.g - this.b) / range + 360.0F) % 360.0F;
        } else if (max == this.g) {
            hsv[0] = 60.0F * (this.b - this.r) / range + 120.0F;
        } else {
            hsv[0] = 60.0F * (this.r - this.g) / range + 240.0F;
        }

        if (max > 0.0F) {
            hsv[1] = 1.0F - min / max;
        } else {
            hsv[1] = 0.0F;
        }

        hsv[2] = max;
        return hsv;
    }

    public static Color HSVtoRGB(float h, float s, float v, float alpha) {
        Color c = HSVtoRGB(h, s, v);
        c.a = alpha;
        return c;
    }

    public static Color HSVtoRGB(float h, float s, float v) {
        Color c = new Color(1.0F, 1.0F, 1.0F, 1.0F);
        HSVtoRGB(h, s, v, c);
        return c;
    }

    public static Color HSVtoRGB(float h, float s, float v, Color targetColor) {
        if (h == 360.0F) {
            h = 359.0F;
        }

        h = (float) Math.max(0.0D, Math.min(360.0D, (double) h));
        s = (float) Math.max(0.0D, Math.min(100.0D, (double) s));
        v = (float) Math.max(0.0D, Math.min(100.0D, (double) v));
        s /= 100.0F;
        v /= 100.0F;
        h /= 60.0F;
        int i = Mathf.floor(h);
        float f = h - (float) i;
        float p = v * (1.0F - s);
        float q = v * (1.0F - s * f);
        float t = v * (1.0F - s * (1.0F - f));
        float r;
        float g;
        float b;
        switch (i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            default:
                r = v;
                g = p;
                b = q;
        }

        targetColor.set(r, g, b, targetColor.a);
        return targetColor;
    }

    public static int[] RGBtoHSV(Color c) {
        return RGBtoHSV(c.r, c.g, c.b);
    }

    public static int[] RGBtoHSV(float r, float g, float b) {
        float min = Math.min(Math.min(r, g), b);
        float max = Math.max(Math.max(r, g), b);
        float delta = max - min;
        float h;
        float s;
        if (max != 0.0F) {
            s = delta / max;
            if (delta == 0.0F) {
                h = 0.0F;
            } else if (r == max) {
                h = (g - b) / delta;
            } else if (g == max) {
                h = 2.0F + (b - r) / delta;
            } else {
                h = 4.0F + (r - g) / delta;
            }

            h *= 60.0F;
            if (h < 0.0F) {
                h += 360.0F;
            }

            s *= 100.0F;
            float v = max * 100.0F;
            return new int[]{Mathf.round(h), Mathf.round(s), Mathf.round(v)};
        } else {
            s = 0.0F;
            h = 0.0F;
            return new int[]{Mathf.round(h), Mathf.round(s), Mathf.round(max)};
        }
    }

    public Color cpy() {
        return new Color(this);
    }

    public Color lerp(Color[] colors, float s) {
        int l = colors.length;
        Color a = colors[(int) (s * (float) (l - 1))];
        Color b = colors[Mathf.clamp((int) (s * (float) (l - 1) + 1.0F), 0, l - 1)];
        float n = s * (float) (l - 1) - (float) ((int) (s * (float) (l - 1)));
        float i = 1.0F - n;
        return this.set(a.r * i + b.r * n, a.g * i + b.g * n, a.b * i + b.b * n, 1.0F);
    }

    static {
        whiteFloatBits = white.toFloatBits();
        clearFloatBits = clear.toFloatBits();
        blackFloatBits = black.toFloatBits();
        blue = new Color(0.0F, 0.0F, 1.0F, 1.0F);
        navy = new Color(0.0F, 0.0F, 0.5F, 1.0F);
        royal = new Color(1097458175);
        slate = new Color(1887473919);
        sky = new Color(-2016482305);
        cyan = new Color(0.0F, 1.0F, 1.0F, 1.0F);
        teal = new Color(0.0F, 0.5F, 0.5F, 1.0F);
        green = new Color(16711935);
        acid = new Color(2147418367);
        lime = new Color(852308735);
        forest = new Color(579543807);
        olive = new Color(1804477439);
        yellow = new Color(-65281);
        gold = new Color(-2686721);
        goldenrod = new Color(-626712321);
        orange = new Color(-5963521);
        brown = new Color(-1958407169);
        tan = new Color(-759919361);
        brick = new Color(-1306385665);
        red = new Color(-16776961);
        scarlet = new Color(-13361921);
        crimson = new Color(-602653441);
        coral = new Color(-8433409);
        salmon = new Color(-92245249);
        pink = new Color(-9849601);
        magenta = new Color(1.0F, 0.0F, 1.0F, 1.0F);
        purple = new Color(-1608453889);
        violet = new Color(-293409025);
        maroon = new Color(-1339006721);
        tmpHSV = new float[3];
    }
}
