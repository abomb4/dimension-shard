package dimensionshard.libs;

import arc.math.Mathf;
import arc.struct.IntSeq;
import arc.struct.Seq;

/**
 * @author abomb4 2023-08-04
 */
public class ProbabilitySelector<T> {

    final Seq<T> objects;
    final IntSeq probabilities;
    int maxProbabilitySum = 0;

    public ProbabilitySelector() {
        this(10);
    }

    public ProbabilitySelector(int capacity) {
        this.objects = new Seq<>(capacity);
        this.probabilities = new IntSeq(capacity);
    }

    public void add(T obj, int probability) {
        maxProbabilitySum += probability;
        objects.add(obj);
        probabilities.add(maxProbabilitySum);
    }

    public T random() {
        int random = Mathf.random(0, maxProbabilitySum - 1);
        for (var i = 0; i < probabilities.size; i++) {
            var max = probabilities.get(i);
            if (random < max) {
                return objects.get(i);
            }
        }
        throw new UnsupportedOperationException("IMPOSSIBLE!!! THIS IS A BUG");
    }
}
