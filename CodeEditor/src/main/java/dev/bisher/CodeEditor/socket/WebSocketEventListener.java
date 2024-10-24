package dev.bisher.CodeEditor.socket;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    @EventListener
    public void handleConnectEvent(SessionConnectedEvent event) {
        System.out.println("Client connected");
    }

    @EventListener
    public void handleDisconnectEvent(SessionDisconnectEvent event) {
        System.out.println("Client disconnected");
    }
}
