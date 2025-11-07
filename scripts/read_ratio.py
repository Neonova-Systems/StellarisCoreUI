import time
import psutil
import sys

# --- Configuration ---
DEVICE = "nvme0n1" # <--- CHANGE THIS to your device (e.g., "sda")
INTERVAL = 0.7    # How long to sample (in seconds)
# ---------------------

# Get initial snapshot
try:
    counters1 = psutil.disk_io_counters(perdisk=True)
    if DEVICE not in counters1:
        print(f"Error: Device '{DEVICE}' not found.", file=sys.stderr)
        sys.exit(1)
    io1 = counters1[DEVICE]
except Exception as e:
    print(f"Error getting initial stats: {e}", file=sys.stderr)
    sys.exit(1)

time.sleep(INTERVAL)

# Get second snapshot
try:
    counters2 = psutil.disk_io_counters(perdisk=True)
    io2 = counters2[DEVICE]
except Exception as e:
    print(f"Error getting second stats: {e}", file=sys.stderr)
    sys.exit(1)

# --- Calculate Deltas ---
delta_reads = io2.read_count - io1.read_count
delta_writes = io2.write_count - io1.write_count
delta_total_ops = delta_reads + delta_writes

# --- Calculate Read Operation Ratio ---
read_ratio = 0.0
if delta_total_ops > 0:
    read_ratio = delta_reads / delta_total_ops

# Print the final ratio, formatted to two decimal places
print(f"{read_ratio:.2f}")