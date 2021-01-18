//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.abomb4.antialias;

import java.util.Random;

public class Rand extends Random {
    private static final double NORM_DOUBLE = 1.1102230246251565E-16D;
    private static final double NORM_FLOAT = 5.9604644775390625E-8D;
    private long seed0;
    private long seed1;

    public Rand() {
        this.setSeed((new Random()).nextLong());
    }

    public Rand(long seed) {
        this.setSeed(seed);
    }

    public Rand(long seed0, long seed1) {
        this.setState(seed0, seed1);
    }

    private static long murmurHash3(long x) {
        x ^= x >>> 33;
        x *= -49064778989728563L;
        x ^= x >>> 33;
        x *= -4265267296055464877L;
        x ^= x >>> 33;
        return x;
    }

    public long nextLong() {
        long s1 = this.seed0;
        long s0 = this.seed1;
        this.seed0 = s0;
        s1 ^= s1 << 23;
        return (this.seed1 = s1 ^ s0 ^ s1 >>> 17 ^ s0 >>> 26) + s0;
    }

    protected final int next(int bits) {
        return (int)(this.nextLong() & (1L << bits) - 1L);
    }

    public int nextInt() {
        return (int)this.nextLong();
    }

    public int nextInt(int n) {
        return (int)this.nextLong((long)n);
    }

    public long nextLong(long n) {
        if (n <= 0L) {
            throw new IllegalArgumentException("n must be positive");
        } else {
            long bits;
            long value;
            do {
                bits = this.nextLong() >>> 1;
                value = bits % n;
            } while(bits - value + (n - 1L) < 0L);

            return value;
        }
    }

    public double nextDouble() {
        return (double)(this.nextLong() >>> 11) * 1.1102230246251565E-16D;
    }

    public float nextFloat() {
        return (float)((double)(this.nextLong() >>> 40) * 5.9604644775390625E-8D);
    }

    public boolean nextBoolean() {
        return (this.nextLong() & 1L) != 0L;
    }

    public void nextBytes(byte[] bytes) {
        int n;
        int i = bytes.length;

        while(i != 0) {
            n = i < 8 ? i : 8;

            for(long bits = this.nextLong(); n-- != 0; bits >>= 8) {
                --i;
                bytes[i] = (byte)((int)bits);
            }
        }

    }

    public void setSeed(long seed) {
        long seed0 = murmurHash3(seed == 0L ? -9223372036854775808L : seed);
        this.setState(seed0, murmurHash3(seed0));
    }

    public boolean chance(double chance) {
        return this.nextDouble() < chance;
    }

    public float range(float amount) {
        return this.nextFloat() * amount * 2.0F - amount;
    }

    public float random(float max) {
        return this.nextFloat() * max;
    }

    public int random(int max) {
        return this.nextInt(max + 1);
    }

    public float random(float min, float max) {
        return min + (max - min) * this.nextFloat();
    }

    public int range(int amount) {
        return this.nextInt(amount * 2 + 1) - amount;
    }

    public int random(int min, int max) {
        return min + this.nextInt(max - min + 1);
    }

    public void setState(long seed0, long seed1) {
        this.seed0 = seed0;
        this.seed1 = seed1;
    }

    public long getState(int seed) {
        return seed == 0 ? this.seed0 : this.seed1;
    }
}
