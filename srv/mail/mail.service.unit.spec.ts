import { describe, it, expect, vi } from 'vitest';
import { sendCosmicWelcomeEmail } from './mail.service';

function makeMockTransport() {
  return vi.fn().mockResolvedValue(undefined);
}

describe('sendCosmicWelcomeEmail', () => {
  describe('recipient (to)', () => {
    it('includes the spacefarer name in the recipient field', async () => {
      const transport = makeMockTransport();

      await sendCosmicWelcomeEmail({ name: 'Alara Voss', origin_planet: 'Mars Prime' }, transport);

      const [payload] = transport.mock.calls[0];
      expect(payload.to).toContain('Alara Voss');
    });

    it('falls back to "Spacefarer" when name is missing', async () => {
      const transport = makeMockTransport();

      await sendCosmicWelcomeEmail({ origin_planet: 'Mars Prime' }, transport);

      const [payload] = transport.mock.calls[0];
      expect(payload.to).toContain('Spacefarer');
    });
  });

  describe('subject', () => {
    it('contains a congratulatory cosmic keyword', async () => {
      const transport = makeMockTransport();

      await sendCosmicWelcomeEmail({ name: 'Alara Voss', origin_planet: 'Mars Prime' }, transport);

      const [payload] = transport.mock.calls[0];
      expect(payload.subject).toMatch(/congratulations|cosmic|adventure/i);
    });
  });

  describe('body', () => {
    it('addresses the spacefarer by name', async () => {
      const transport = makeMockTransport();

      await sendCosmicWelcomeEmail({ name: 'Zephyr Blane', origin_planet: 'Kepler-186f' }, transport);

      const [payload] = transport.mock.calls[0];
      expect(payload.body).toMatch(/Zephyr Blane/i);
    });

    it('includes the origin planet', async () => {
      const transport = makeMockTransport();

      await sendCosmicWelcomeEmail({ name: 'Zephyr Blane', origin_planet: 'Kepler-186f' }, transport);

      const [payload] = transport.mock.calls[0];
      expect(payload.body).toMatch(/Kepler-186f/i);
    });

    it('falls back to "the cosmos" when origin_planet is missing', async () => {
      const transport = makeMockTransport();

      await sendCosmicWelcomeEmail({ name: 'Mira Sol' }, transport);

      const [payload] = transport.mock.calls[0];
      expect(payload.body).toMatch(/the cosmos/i);
    });
  });

  describe('transport invocation', () => {
    it('calls the transport exactly once per spacefarer', async () => {
      const transport = makeMockTransport();

      await sendCosmicWelcomeEmail({ name: 'Mira Sol', origin_planet: 'Föld' }, transport);

      expect(transport).toHaveBeenCalledOnce();
    });

    it('resolves successfully when transport succeeds', async () => {
      const transport = makeMockTransport();

      await expect(
        sendCosmicWelcomeEmail({ name: 'Mira Sol', origin_planet: 'Föld' }, transport),
      ).resolves.not.toThrow();
    });

    it('propagates transport errors to the caller', async () => {
      const transport = vi.fn().mockRejectedValue(new Error('SMTP failure'));

      await expect(sendCosmicWelcomeEmail({ name: 'Mira Sol', origin_planet: 'Föld' }, transport)).rejects.toThrow(
        'SMTP failure',
      );
    });
  });
});
