import { describe, it, expect, vi } from 'vitest';

import { validateAndEnhanceSpacefarer } from './spacefarer.service';
import { sendCosmicWelcomeEmail } from '../mail/mail.service';

/** Minimal stand-in for a CAP Request object used in @Before handlers */
function makeMockRequest(data: Record<string, unknown>) {
  return {
    data,
    error: vi.fn(),
  };
}

describe('validateAndEnhanceSpacefarer (@Before CREATE)', () => {
  describe('stardust_collection validation', () => {
    it('rejects a missing stardust_collection', () => {
      const req = makeMockRequest({ wormhole_navigation_skill: 50 });

      validateAndEnhanceSpacefarer(req as any);

      expect(req.error).toHaveBeenCalledOnce();
      expect(req.error).toHaveBeenCalledWith(400, expect.stringMatching(/stardust/i));
    });

    it('rejects a negative stardust_collection', () => {
      const req = makeMockRequest({
        stardust_collection: -1,
        wormhole_navigation_skill: 50,
      });

      validateAndEnhanceSpacefarer(req as any);

      expect(req.error).toHaveBeenCalledOnce();
      expect(req.error).toHaveBeenCalledWith(400, expect.stringMatching(/stardust/i));
    });

    it('accepts zero stardust_collection and boosts it to the cosmic minimum', () => {
      const req = makeMockRequest({
        stardust_collection: 0,
        wormhole_navigation_skill: 50,
      });

      validateAndEnhanceSpacefarer(req as any);

      expect(req.error).not.toHaveBeenCalled();
      // 0 is below the minimum threshold → must be boosted
      expect(req.data.stardust_collection).toBeGreaterThan(0);
    });

    it('does not alter an already healthy stardust_collection', () => {
      const req = makeMockRequest({
        stardust_collection: 9999,
        wormhole_navigation_skill: 50,
      });

      validateAndEnhanceSpacefarer(req as any);

      expect(req.error).not.toHaveBeenCalled();
      expect(req.data.stardust_collection).toBe(9999);
    });
  });

  describe('wormhole_navigation_skill validation', () => {
    it('rejects a missing wormhole_navigation_skill', () => {
      const req = makeMockRequest({ stardust_collection: 500 });

      validateAndEnhanceSpacefarer(req as any);

      expect(req.error).toHaveBeenCalledOnce();
      expect(req.error).toHaveBeenCalledWith(400, expect.stringMatching(/wormhole/i));
    });

    it('rejects skill below 0', () => {
      const req = makeMockRequest({
        stardust_collection: 500,
        wormhole_navigation_skill: -5,
      });

      validateAndEnhanceSpacefarer(req as any);

      expect(req.error).toHaveBeenCalledWith(400, expect.stringMatching(/wormhole/i));
    });

    it('rejects skill above 100', () => {
      const req = makeMockRequest({
        stardust_collection: 500,
        wormhole_navigation_skill: 101,
      });

      validateAndEnhanceSpacefarer(req as any);

      expect(req.error).toHaveBeenCalledWith(400, expect.stringMatching(/wormhole/i));
    });

    it('boosts a skill that is valid but below the cosmic minimum threshold', () => {
      const req = makeMockRequest({
        stardust_collection: 500,
        wormhole_navigation_skill: 3, // valid range, but too low for a journey
      });

      validateAndEnhanceSpacefarer(req as any);

      expect(req.error).not.toHaveBeenCalled();
      expect(req.data.wormhole_navigation_skill).toBeGreaterThan(3);
    });

    it('does not alter a skill already above the threshold', () => {
      const req = makeMockRequest({
        stardust_collection: 500,
        wormhole_navigation_skill: 75,
      });

      validateAndEnhanceSpacefarer(req as any);

      expect(req.error).not.toHaveBeenCalled();
      expect(req.data.wormhole_navigation_skill).toBe(75);
    });
  });

  describe('combined happy path', () => {
    it('passes through a fully valid spacefarer without changes', () => {
      const req = makeMockRequest({
        name: 'Nova Strider',
        stardust_collection: 1000,
        wormhole_navigation_skill: 80,
        origin_planet: 'Mars Prime',
        spacesuit_color: 'Silver',
      });

      validateAndEnhanceSpacefarer(req as any);

      expect(req.error).not.toHaveBeenCalled();
      expect(req.data.stardust_collection).toBe(1000);
      expect(req.data.wormhole_navigation_skill).toBe(80);
    });
  });
});

describe('sendCosmicWelcomeEmail (@After CREATE)', () => {
  // We keep the email transport injectable so tests stay fast & offline.
  // The real implementation will default to a console/nodemailer transport.

  it('calls the email transport with the new spacefarer name', async () => {
    const mockTransport = vi.fn().mockResolvedValue(undefined);

    const spacefarer = {
      ID: 's1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6',
      name: 'Alara Voss',
      origin_planet: 'Mars Prime',
    };

    await sendCosmicWelcomeEmail(spacefarer as any, mockTransport);

    expect(mockTransport).toHaveBeenCalledOnce();
    const [payload] = mockTransport.mock.calls[0];
    expect(payload).toMatchObject({
      to: expect.stringContaining('Alara Voss'),
      subject: expect.stringMatching(/congratulations|cosmic|adventure/i),
      body: expect.stringMatching(/Alara Voss/i),
    });
  });

  it('includes the spacefarer origin planet in the email body', async () => {
    const mockTransport = vi.fn().mockResolvedValue(undefined);

    await sendCosmicWelcomeEmail(
      { ID: 'abc', name: 'Zephyr Blane', origin_planet: 'Kepler-186f' } as any,
      mockTransport,
    );

    const [payload] = mockTransport.mock.calls[0];
    expect(payload.body).toMatch(/Kepler-186f/i);
  });

  it('does not throw when the transport resolves successfully', async () => {
    const mockTransport = vi.fn().mockResolvedValue(undefined);

    await expect(
      sendCosmicWelcomeEmail({ ID: 'xyz', name: 'Mira Sol', origin_planet: 'Föld' } as any, mockTransport),
    ).resolves.not.toThrow();
  });

  it('propagates transport errors so the caller can handle them', async () => {
    const mockTransport = vi.fn().mockRejectedValue(new Error('SMTP failure'));

    await expect(
      sendCosmicWelcomeEmail({ ID: 'xyz', name: 'Mira Sol', origin_planet: 'Föld' } as any, mockTransport),
    ).rejects.toThrow('SMTP failure');
  });
});
