import asyncio
import websockets

async def test():
    try:
        ws = await websockets.connect('ws://localhost:8000/api/v1/ws/cpu-metrics')
        print('Connected')
        msg = await ws.recv()
        print('Received:', msg)
        await ws.close()
    except Exception as e:
        print('Error:', e)

asyncio.run(test())
