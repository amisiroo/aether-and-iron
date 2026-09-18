import { describe, expect, it } from 'vitest';
import { classifyTileInteraction, interactableHint } from './interaction';
import type { Entity, Interactable } from '../types/game';

const enemy = { id: 'e', x: 2, y: 2, hp: 4 } as Entity;
const interactable = { id: 'chest', x: 2, y: 2, name: 'Guild supply chest', resolved: false, check: { stat: 'DEX', dc: 11, prompt: 'open' } } as Interactable;

describe('tile interaction classification', () => {
  it('prioritizes an active enemy over generic tile movement', () => {
    expect(classifyTileInteraction(2, 2, [enemy], []).kind).toBe('enemy');
  });
  it('returns an interactable before blocked tile logic can run', () => {
    const result = classifyTileInteraction(2, 2, [], [interactable]);
    expect(result).toEqual({ kind: 'interactable', interactable });
    expect(interactableHint(interactable)).toBe('Interact: Guild supply chest (DEX DC 11)');
  });
  it('ignores resolved interactables', () => {
    expect(classifyTileInteraction(2, 2, [], [{ ...interactable, resolved: true }]).kind).toBe('tile');
  });
});
