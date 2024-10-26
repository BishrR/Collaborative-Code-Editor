package dev.bisher.CodeEditor.socket;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class WebSocketHandler extends TextWebSocketHandler {

    private static Set<WebSocketSession> sessions = new HashSet<>();

    private final Lock lock = new ReentrantLock();
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);

    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        if (lock.tryLock()){
         try {
             for (WebSocketSession webSocketSession : sessions) {
                 if (webSocketSession.isOpen()) {
                     try {
                         webSocketSession.sendMessage(message);
                     } catch (IOException e) {
                         e.printStackTrace();
                     }
                 }
             }
         } finally {
             lock.unlock();
         }
        } else {
            System.out.println("Lock not acquired, waiting for release");
        }

    }
}
