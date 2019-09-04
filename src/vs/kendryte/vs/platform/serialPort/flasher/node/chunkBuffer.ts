import { Transform } from 'stream';

export class ChunkBuffer extends Transform {
	private readonly buffer: Buffer;
	private currentLength = 0;

	constructor(private readonly size: number) {
		super();
		this.buffer = Buffer.alloc(size);
	}

	_transform(chunk: Buffer, encoding: string, callback: Function): void {
		if (chunk.length + this.currentLength >= this.size) {
			const remain = this.size - this.currentLength;

			chunk.copy(this.buffer, this.currentLength, 0, remain);

			this.push(Buffer.concat([
				this.buffer.slice(0, this.currentLength),
				chunk.slice(0, remain),
			]));

			let i: number;
			for (i = remain; i + this.size < chunk.length; i += this.size) {
				this.push(Buffer.from(chunk.slice(i, i + this.size)));
			}

			this.currentLength = chunk.copy(this.buffer, 0, i);
		} else {
			chunk.copy(this.buffer, this.currentLength);
			this.currentLength = chunk.length + this.currentLength;
		}
		callback();
	}

	_flush(callback: Function): void {
		if (this.currentLength > 0) {
			this.buffer.fill(0, this.currentLength);
			this.push(this.buffer.slice(0));
		}
		callback();
	}
}

export function* eachChunkPadding(buff: Buffer, size: number) {
	for (let curr = 0; curr < buff.length; curr += size) {
		const view = buff.slice(curr, curr + size);
		if (view.length < size) {
			yield Buffer.concat([view, Buffer.alloc(size - view.length, 0)]);
		} else {
			yield view;
		}
	}
}

export interface IBufferChunk {
	chunk: Buffer;
	position: number;
	index: number;
}

export function* eachChunkPaddingWithSize(buff: Buffer, size: number): IterableIterator<IBufferChunk> {
	let index = 0;
	for (let curr = 0; curr < buff.length; curr += size) {
		let view: Buffer = buff.slice(curr, curr + size);
		if (view.length < size) {
			view = Buffer.concat([view, Buffer.alloc(size - view.length, 0)]);
		}

		yield {
			chunk: view,
			position: curr,
			index,
		};

		index++;
	}
}

