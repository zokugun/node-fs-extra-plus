import { type BigIntStats, type Stats } from 'node:fs';

export function areIdentical(sourceStat: Stats | BigIntStats, destinationStat: Stats | BigIntStats): boolean {
	// stat.dev can be 0n on windows when node version >= 22.x.x
	return destinationStat.ino !== undefined && destinationStat.dev !== undefined && destinationStat.ino === sourceStat.ino && destinationStat.dev === sourceStat.dev;
}
