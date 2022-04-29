import { convertBep20ToStellarMemo } from './bscService'

describe('convertBep20ToStellarMemo', () => {
    it('should successfully convert bep20 to stellar memo text', async () => {
        const memo = await convertBep20ToStellarMemo('0x53d17EBE198ECDc387d3c6EB5964216dfda2d29E')

        expect(memo).toEqual('U9F+vhmOzcOH08brWWQhbf2i0p4=')
    }, 60000)

    it('should not successfully convert bep20 to stellar memo text', async () => {
        try {
            await convertBep20ToStellarMemo('0x53d17EEREWBE198ECDc387d3c6EB5964216dfda2d29E')
            // Fail test if above expression doesn't throw anything.
            expect(true).toBe(false)
        } catch (e) {
            expect(e.message).toBe("BEP20 Address is not valid")
        }
    }, 60000)
})