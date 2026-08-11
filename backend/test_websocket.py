"""
Simple WebSocket test script to verify the connection works.
"""
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/api/v1/ws/cpu-metrics"
    print(f"Attempting to connect to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✓ WebSocket connection established successfully!")
            
            # Wait for messages
            message_count = 0
            timeout = 10  # seconds
            
            try:
                while message_count < 5:
                    try:
                        message = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                        data = json.loads(message)
                        print(f"✓ Received message {message_count + 1}: {data}")
                        message_count += 1
                    except asyncio.TimeoutError:
                        print("Waiting for messages...")
                        continue
                        
            except Exception as e:
                print(f"Error receiving messages: {e}")
                
            print(f"\n✓ Successfully received {message_count} messages")
            print("✓ WebSocket test completed successfully!")
            
    except ConnectionRefusedError:
        print("✗ Connection refused - ensure backend is running on port 8000")
    except Exception as e:
        print(f"✗ WebSocket connection failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_websocket())
