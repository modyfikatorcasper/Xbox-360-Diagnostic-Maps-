# Xbox Series S SSD — alexmi256 case study (2022)
Source: https://gist.github.com/alexmi256/e1b9b31c33d410c787ebe66eec5c7f89
Reviewed: 2026-10-10
Status: public anecdotal diagnostic case, not a verified repair for update-loop.

## Situation
Series S stuck in Xbox Live update/setup loop. With Wi-Fi module attached error usually 0x80072f8f; without module 0x87DD0003. Offline OSU1, reset and DNS changes did not solve the reported problem.

## SSD and partition information
Model SSSTC XA1-31512; 450,971,566,080 bytes (~420 GiB); NVMe 1.4; formatted 4,096 byte LBA; GPT primary table reported usable but backup GPT flagged corrupt/mismatched by fdisk. Do not write partition changes merely because fdisk suggests correction.
Partitions (start-end LBAs, sectors in 4096-byte units):
p1 6-262149, 262144 sectors, 1 GiB (GParted identified XBFS);
p2 262150-4718597, 4456448 sectors, 17 GiB;
p3 4718598-100139013, 95420416 sectors, 364 GiB;
p4 100139014-104857605, 4718592 sectors, 18 GiB;
p5 104857606-108003333, 3145728 sectors, 12 GiB;
p6 108003334-109838341, 1835008 sectors, 7 GiB.
The gist does NOT identify each partition by System Support/System Update role; do not assign these labels based on size alone.

## NVMe SMART snapshot
smartctl SMART self-assessment FAILED due to temperature; 80 C composite; 105 C sensor 2; 43 C sensor 8; critical warning 0x02 (temperature); 79 C warning threshold, 85 C critical threshold; power-on hours 8; power cycles 84; unsafe shutdowns 19; media/data integrity errors 0; error log entries 11; percentage used 0%; 106 minutes warning temperature and 5 minutes critical temperature reported. SSD reportedly passed SMART after an added heatsink, but no evidence the Xbox update loop was resolved.

## Proposed safe workflow
1. Physically remove and connect SSD to Linux with suitable NVMe adapter.
2. **Read-only** collect `lsblk -o NAME,SIZE,MODEL,LOG-SEC,FSTYPE`, `sudo fdisk -l /dev/nvme0n1`, `sudo smartctl -x /dev/nvme0n1`, `sudo nvme id-ctrl /dev/nvme0n1`, `sudo nvme id-ns /dev/nvme0n1`, `sudo nvme smart-log /dev/nvme0n1`, `sudo nvme error-log /dev/nvme0n1` (device path as appropriate).
3. Preserve raw output, record operating temperature, cooling method, cable/adapter, timestamps, model, firmware, LBA size and hash of acquired image if created.
4. Image entire disk read-only prior to any attempted GPT correction, formatting, OSU repair or partition write; use appropriate imaging and verify hashes.
5. Compare GPT primary/backup, partition offsets/size, XBFS identification, available NVMe SMART and NVMe error/telemetry logs with known-good same-model reference.
6. If thermal warning is present, test again with reliable cooling and record SMART warning flags; avoid claiming temperature alone caused update failure.
7. Correlate with POST/UART and Device Portal evidence only when independently collected.
8. For updates stuck at 94%, treat this as a differential-diagnosis example, NOT a demonstrated fix.

## Potential module
SSD/NVMe Health & Layout Inspector: detect 4096-byte sectors, partition table consistency, GPT backup mismatch, temperatures (including individual sensors), critical-warning flags, unsafe shutdowns, media errors and error log changes across capture sessions. Distinguish facts from hypotheses and never automatically repair GPT on the patient's original SSD.
