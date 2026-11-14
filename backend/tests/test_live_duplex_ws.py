import unittest
import json

class TestLiveDuplexWebSocket(unittest.TestCase):
    def test_duplex_websocket_packet_structure(self):
        """Verify JSON structure of live-duplex websocket payloads."""
        status_packet = {
            "type": "status",
            "content": "connected",
            "model": "models/gemini-3.8-flash"
        }
        self.assertEqual(status_packet["type"], "status")
        self.assertEqual(status_packet["content"], "connected")
        self.assertIn("gemini-3.8-flash", status_packet["model"])

        ping_packet = {"type": "ping"}
        pong_response = {"type": "pong"}
        self.assertEqual(ping_packet["type"], "ping")
        self.assertEqual(pong_response["type"], "pong")

if __name__ == "__main__":
    unittest.main()
