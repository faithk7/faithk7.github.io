import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

test('uploaded story metadata survives quotes, colons, and line breaks', () => {
  const cwd = mkdtempSync(path.join(tmpdir(), 'k7y-story-'))
  try {
    mkdirSync(path.join(cwd, '_stories'))
    const photo = {
      id: 'test-photo', uploaded: '2026-10-25T00:00:00Z',
      variants: ['https://example.com/photo.jpg'],
      meta: { tags: ['travel: Boston'], alt: 'A "quoted" photo', caption: 'First line\nSecond: line' }
    }
    execFileSync(process.execPath, [fileURLToPath(new URL('./media.js', import.meta.url)), '_data/stories.json', JSON.stringify(photo)], { cwd })
    const source = readFileSync(path.join(cwd, '_stories/test-photo.md'), 'utf8')
    const metadata = JSON.parse(execFileSync('ruby', ['-ryaml', '-rjson', '-e', 'print YAML.safe_load(STDIN.read).to_json'], {
      input: source.split('---')[1], encoding: 'utf8'
    }))
    assert.equal(metadata.title, photo.meta.alt)
    assert.equal(metadata.description, photo.meta.caption)
    assert.equal(metadata.caption, photo.meta.caption)
    assert.deepEqual(metadata.tags, photo.meta.tags)
    assert.deepEqual(JSON.parse(readFileSync(path.join(cwd, '_data/stories.json'), 'utf8')), [photo])
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})
