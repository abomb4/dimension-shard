#!/bin/bash

# Default values
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
MINDUSTRY_JAR_PATH="$HOME/.local/software/mindustry/jre/desktop.jar"
RUN_MINDUSTRY=false
JVM_OPTS="-agentlib:jdwp=transport=dt_socket,server=n,address=localhost:5005,suspend=y"

# Function to print usage information
print_usage() {
    echo "Usage: $(basename "$0") [--help] [--mindustry-jar-path <path>] [--java-home <path>] [--jvm-opts <options>] [--run]"
    echo "Options:"
    echo "  --help                  Show this help message and exit."
    echo "  --mindustry-jar-path    Specify the Mindustry jar path. Default: $MINDUSTRY_JAR_PATH"
    echo "  --java-home             Specify the Java home path. Default: $JAVA_HOME"
    echo "  --jvm-opts              Specify JVM options to be passed to Mindustry."
    echo "  --run                   Run Mindustry after performing checks and tasks."
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --help)
            print_usage
            exit 0
            ;;
        --mindustry-jar-path)
            shift
            MINDUSTRY_JAR_PATH="$1"
            ;;
        --java-home)
            shift
            JAVA_HOME="$1"
            ;;
        --jvm-opts)
            shift
            JVM_OPTS="$1"
            ;;
        --run)
            RUN_MINDUSTRY=true
            ;;
        *)
            echo "Invalid argument: $1"
            print_usage
            exit 1
            ;;
    esac
    shift
done

# Change directory to the script's directory
cd "$SCRIPT_DIR" || {
    echo "Unable to change directory to the script's directory."
    exit 1
}

# Execute ./gradlew jar and copy the jar file
./gradlew jar && cp main/build/libs/dimension-shardDesktop.jar "$HOME/.local/share/Mindustry/mods" || {
    echo "Failed to build or copy the jar file."
    exit 1
}

# Check if --run is specified, then do additional checks
if $RUN_MINDUSTRY; then
    # Check if JAVA_HOME is set and java executable exists
    if [[ -z "$JAVA_HOME" || ! -x "$JAVA_HOME/bin/java" ]]; then
        echo "Java home path is not set correctly or java executable not found. Don't start Mindustry."
        exit 1
    fi

    # Check if MINDUSTRY_JAR_PATH is set and the file exists
    if [[ -z "$MINDUSTRY_JAR_PATH" || ! -f "$MINDUSTRY_JAR_PATH" ]]; then
        echo "Mindustry jar path is not set correctly or the file doesn't exist. Don't start Mindustry."
        exit 1
    fi

    # Execute the Mindustry jar using the specified Java and JVM options
    "$JAVA_HOME/bin/java" $JVM_OPTS -jar "$MINDUSTRY_JAR_PATH"
fi
