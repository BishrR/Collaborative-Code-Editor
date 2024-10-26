package dev.bisher.CodeEditor.service.user;

import dev.bisher.CodeEditor.repository.UserRepository;
import dev.bisher.CodeEditor.model.user.User;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User saveOrUpdateUser(String name, String email, String imageUrl){
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        if (existingUser.isPresent()){
            user = existingUser.get();
            user.setName(name);
            user.setEmail(email);
            user.setImageUrl(imageUrl);
        }else {
            user = new User(name, email, imageUrl);
        }
        return userRepository.save(user);
    }

    public Optional<User> getUserByEmail(String email){
        return userRepository.findByEmail(email);
    }

    public ObjectId getUserId(String email){
        User user =  userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User Not Found!"));
        return user.getObjectId();
    }
}
