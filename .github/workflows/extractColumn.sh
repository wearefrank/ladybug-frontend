#!/bin/bash
#
# Usage:
#     extractColumn.sh <file to extract> <key> <column number to extract, starting from index 1>
#
grep -v -E "^#" $1 | grep "^$2" | sed 's|\s\s*| |g' | cut -d" " -f$3