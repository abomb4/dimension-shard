//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.abomb4.antialias;

import javax.swing.text.Position;

public final class Mathf {
    public static final int[] signs = new int[]{-1, 1};
    public static final int[] one = new int[]{1};
    public static final boolean[] booleans = new boolean[]{true, false};
    public static final float FLOAT_ROUNDING_ERROR = 1.0E-6F;
    public static final float PI = 3.1415927F;
    public static final float pi = 3.1415927F;
    public static final float PI2 = 6.2831855F;
    public static final float E = 2.7182817F;
    public static final float sqrt2 = sqrt(2.0F);
    public static final float sqrt3 = sqrt(3.0F);
    public static final float radiansToDegrees = 57.295776F;
    public static final float radDeg = 57.295776F;
    public static final float degreesToRadians = 0.017453292F;
    public static final float degRad = 0.017453292F;
    private static final int SIN_BITS = 14;
    private static final int SIN_MASK = 16383;
    private static final int SIN_COUNT = 16384;
    private static final float radFull = 6.2831855F;
    private static final float degFull = 360.0F;
    private static final float radToIndex = 2607.5945F;
    private static final float degToIndex = 45.511112F;
    private static final int BIG_ENOUGH_INT = 16384;
    private static final double BIG_ENOUGH_FLOOR = 16384.0D;
    private static final double CEIL = 0.9999999D;
    private static final double BIG_ENOUGH_ROUND = 16384.5D;
    private static final Rand seedr = new Rand();
    public static Rand rand = new Rand();

    public Mathf() {
    }

    public static float sin(float radians) {
        return Mathf.Sin.table[(int)(radians * 2607.5945F) & 16383];
    }

    public static float cos(float radians) {
        return Mathf.Sin.table[(int)((radians + 1.5707964F) * 2607.5945F) & 16383];
    }

    public static float sinDeg(float degrees) {
        return Mathf.Sin.table[(int)(degrees * 45.511112F) & 16383];
    }

    public static float cosDeg(float degrees) {
        return Mathf.Sin.table[(int)((degrees + 90.0F) * 45.511112F) & 16383];
    }

    public static float absin(float in, float scl, float mag) {
        return (sin(in, scl * 2.0F, mag) + mag) / 2.0F;
    }

    public static float tan(float radians, float scl, float mag) {
        return sin(radians / scl) / cos(radians / scl) * mag;
    }

    public static float sin(float radians, float scl, float mag) {
        return sin(radians / scl) * mag;
    }

    public static float cos(float radians, float scl, float mag) {
        return cos(radians / scl) * mag;
    }

    public static float angle(float x, float y) {
        float result = atan2(x, y) * 57.295776F;
        if (result < 0.0F) {
            result += 360.0F;
        }

        return result;
    }

    public static float angleExact(float x, float y) {
        float result = (float)Math.atan2((double)y, (double)x) * 57.295776F;
        if (result < 0.0F) {
            result += 360.0F;
        }

        return result;
    }

    public static float wrapAngleAroundZero(float a) {
        float rotation;
        if (a >= 0.0F) {
            rotation = a % 6.2831855F;
            if (rotation > 3.1415927F) {
                rotation -= 6.2831855F;
            }

            return rotation;
        } else {
            rotation = -a % 6.2831855F;
            if (rotation > 3.1415927F) {
                rotation -= 6.2831855F;
            }

            return -rotation;
        }
    }

    public static float atan2(float x, float y) {
        if (Math.abs(x) < 1.0E-7F) {
            if (y > 0.0F) {
                return 1.5707964F;
            } else {
                return y == 0.0F ? 0.0F : -1.5707964F;
            }
        } else {
            float z = y / x;
            float atan;
            if (Math.abs(z) < 1.0F) {
                atan = z / (1.0F + 0.28F * z * z);
                return x < 0.0F ? atan + (y < 0.0F ? -3.1415927F : 3.1415927F) : atan;
            } else {
                atan = 1.5707964F - z / (z * z + 0.28F);
                return y < 0.0F ? atan - 3.1415927F : atan;
            }
        }
    }

    public static int digits(int n) {
        return n < 100000 ? (n < 100 ? (n < 10 ? 1 : 2) : (n < 1000 ? 3 : (n < 10000 ? 4 : 5))) : (n < 10000000 ? (n < 1000000 ? 6 : 7) : (n < 100000000 ? 8 : (n < 1000000000 ? 9 : 10)));
    }

    public static float sqrt(float x) {
        return (float)Math.sqrt((double)x);
    }

    public static float sqr(float x) {
        return x * x;
    }

    public static float map(float value, float froma, float toa, float fromb, float tob) {
        return fromb + (value - froma) * (tob - fromb) / (toa - froma);
    }

    public static float map(float value, float from, float to) {
        return map(value, 0.0F, 1.0F, from, to);
    }

    public static int sign(float f) {
        return f < 0.0F ? -1 : 1;
    }

    public static int sign(boolean b) {
        return b ? 1 : -1;
    }

    public static int num(boolean b) {
        return b ? 1 : 0;
    }

    public static float pow(float a, float b) {
        return (float)Math.pow((double)a, (double)b);
    }

    public static int pow(int a, int b) {
        return (int)Math.ceil(Math.pow((double)a, (double)b));
    }

    public static float range(float range) {
        return random(-range, range);
    }

    public static int range(int range) {
        return random(-range, range);
    }

    public static float range(float min, float max) {
        return chance(0.5D) ? random(min, max) : -random(min, max);
    }

    public static boolean chance(double d) {
        return (double)rand.nextFloat() < d;
    }

    public static int random(int range) {
        return rand.nextInt(range + 1);
    }

    public static int random(int start, int end) {
        return start + rand.nextInt(end - start + 1);
    }

    public static long random(long range) {
        return (long)(rand.nextDouble() * (double)range);
    }

    public static long random(long start, long end) {
        return start + (long)(rand.nextDouble() * (double)(end - start));
    }

    public static boolean randomBoolean() {
        return rand.nextBoolean();
    }

    public static boolean randomBoolean(float chance) {
        return random() < chance;
    }

    public static float random() {
        return rand.nextFloat();
    }

    public static float random(float range) {
        return rand.nextFloat() * range;
    }

    public static float random(float start, float end) {
        return start + rand.nextFloat() * (end - start);
    }

    public static int randomSign() {
        return 1 | rand.nextInt() >> 31;
    }

    public static int randomSeed(long seed, int min, int max) {
        seedr.setSeed(seed);
        if (isPowerOfTwo(max)) {
            seedr.nextInt();
        }

        return seedr.nextInt(max - min + 1) + min;
    }

    public static float randomSeed(long seed, float min, float max) {
        seedr.setSeed(seed);
        return min + seedr.nextFloat() * (max - min);
    }

    public static float randomSeed(long seed) {
        seedr.setSeed(seed * 99999L);
        return seedr.nextFloat();
    }

    public static float randomSeed(long seed, float max) {
        seedr.setSeed(seed * 99999L);
        return seedr.nextFloat() * max;
    }

    public static float randomSeedRange(long seed, float range) {
        seedr.setSeed(seed * 99999L);
        return range * (seedr.nextFloat() - 0.5F) * 2.0F;
    }

    public static float randomTriangular() {
        return rand.nextFloat() - rand.nextFloat();
    }

    public static float randomTriangular(float max) {
        return (rand.nextFloat() - rand.nextFloat()) * max;
    }

    public static float randomTriangular(float min, float max) {
        return randomTriangular(min, max, (min + max) * 0.5F);
    }

    public static float randomTriangular(float min, float max, float mode) {
        float u = rand.nextFloat();
        float d = max - min;
        return u <= (mode - min) / d ? min + (float)Math.sqrt((double)(u * d * (mode - min))) : max - (float)Math.sqrt((double)((1.0F - u) * d * (max - mode)));
    }

    public static int nextPowerOfTwo(int value) {
        if (value == 0) {
            return 1;
        } else {
            --value;
            value |= value >> 1;
            value |= value >> 2;
            value |= value >> 4;
            value |= value >> 8;
            value |= value >> 16;
            return value + 1;
        }
    }

    public static boolean isPowerOfTwo(int value) {
        return value != 0 && (value & value - 1) == 0;
    }

    public static short clamp(short value, short min, short max) {
        if (value < min) {
            return min;
        } else {
            return value > max ? max : value;
        }
    }

    public static int clamp(int value, int min, int max) {
        if (value < min) {
            return min;
        } else {
            return value > max ? max : value;
        }
    }

    public static long clamp(long value, long min, long max) {
        if (value < min) {
            return min;
        } else {
            return value > max ? max : value;
        }
    }

    public static float clamp(float value, float min, float max) {
        if (value < min) {
            return min;
        } else {
            return value > max ? max : value;
        }
    }

    public static float clamp(float value) {
        return clamp(value, 0.0F, 1.0F);
    }

    public static double clamp(double value, double min, double max) {
        if (value < min) {
            return min;
        } else {
            return value > max ? max : value;
        }
    }

    public static float maxZero(float val) {
        return Math.max(val, 0.0F);
    }

    public static float approach(float from, float to, float speed) {
        return from + clamp(to - from, -speed, speed);
    }

    public static float lerp(float fromValue, float toValue, float progress) {
        return fromValue + (toValue - fromValue) * progress;
    }

    public static float slerpRad(float fromRadians, float toRadians, float progress) {
        float delta = (toRadians - fromRadians + 6.2831855F + 3.1415927F) % 6.2831855F - 3.1415927F;
        return (fromRadians + delta * progress + 6.2831855F) % 6.2831855F;
    }

    public static float slerp(float fromDegrees, float toDegrees, float progress) {
        float delta = (toDegrees - fromDegrees + 360.0F + 180.0F) % 360.0F - 180.0F;
        return (fromDegrees + delta * progress + 360.0F) % 360.0F;
    }

    public static int floor(float value) {
        return (int)((double)value + 16384.0D) - 16384;
    }

    public static int floorPositive(float value) {
        return (int)value;
    }

    public static int ceil(float value) {
        return 16384 - (int)(16384.0D - (double)value);
    }

    public static int ceilPositive(float value) {
        return (int)((double)value + 0.9999999D);
    }

    public static int round(float value) {
        return (int)((double)value + 16384.5D) - 16384;
    }

    public static int round(int value, int step) {
        return value / step * step;
    }

    public static float round(float value, float step) {
        return (float)((int)(value / step)) * step;
    }

    public static int round(float value, int step) {
        return (int)(value / (float)step) * step;
    }

    public static int roundPositive(float value) {
        return (int)(value + 0.5F);
    }

    public static boolean zero(float value) {
        return Math.abs(value) <= 1.0E-6F;
    }

    public static boolean zero(double value) {
        return Math.abs(value) <= 9.999999974752427E-7D;
    }

    public static boolean zero(float value, float tolerance) {
        return Math.abs(value) <= tolerance;
    }

    public static boolean equal(float a, float b) {
        return Math.abs(a - b) <= 1.0E-6F;
    }

    public static boolean equal(float a, float b, float tolerance) {
        return Math.abs(a - b) <= tolerance;
    }

    public static float log(float a, float value) {
        return (float)(Math.log((double)value) / Math.log((double)a));
    }

    public static float log2(float value) {
        return (float)Math.log((double)value) / 0.30103F;
    }

    public static float mod(float f, float n) {
        return (f % n + n) % n;
    }

    public static int mod(int x, int n) {
        return (x % n + n) % n;
    }

    public static float slope(float fin) {
        return 1.0F - Math.abs(fin - 0.5F) * 2.0F;
    }

    public static float curve(float f, float offset) {
        return f < offset ? 0.0F : (f - offset) / (1.0F - offset);
    }

    public static float curve(float f, float from, float to) {
        if (f < from) {
            return 0.0F;
        } else {
            return f > to ? 1.0F : (f - from) / (to - from);
        }
    }

    public static float len(float x, float y) {
        return (float)Math.sqrt((double)(x * x + y * y));
    }

    public static float len2(float x, float y) {
        return x * x + y * y;
    }

    public static float dot(float x1, float y1, float x2, float y2) {
        return x1 * x2 + y1 * y2;
    }

    public static float dst(float x1, float y1) {
        return (float)Math.sqrt((double)(x1 * x1 + y1 * y1));
    }

    public static float dst2(float x1, float y1) {
        return x1 * x1 + y1 * y1;
    }

    public static float dst(float x1, float y1, float x2, float y2) {
        float x_d = x2 - x1;
        float y_d = y2 - y1;
        return (float)Math.sqrt((double)(x_d * x_d + y_d * y_d));
    }

    public static float dst2(float x1, float y1, float x2, float y2) {
        float x_d = x2 - x1;
        float y_d = y2 - y1;
        return x_d * x_d + y_d * y_d;
    }

    public static float dstm(float x1, float y1, float x2, float y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    public static boolean within(float x1, float y1, float x2, float y2, float dst) {
        return dst2(x1, y1, x2, y2) < dst * dst;
    }

    public static boolean within(float x1, float y1, float dst) {
        return x1 * x1 + y1 * y1 < dst * dst;
    }

    private static class Sin {
        static final float[] table = new float[16384];

        private Sin() {
        }

        static {
            int i;
            for(i = 0; i < 16384; ++i) {
                table[i] = (float)Math.sin((double)(((float)i + 0.5F) / 16384.0F * 6.2831855F));
            }

            for(i = 0; i < 360; i += 90) {
                table[(int)((float)i * 45.511112F) & 16383] = (float)Math.sin((double)((float)i * 0.017453292F));
            }

        }
    }
}
