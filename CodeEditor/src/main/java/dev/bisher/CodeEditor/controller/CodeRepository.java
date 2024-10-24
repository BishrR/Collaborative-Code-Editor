package dev.bisher.CodeEditor.controller;

import dev.bisher.CodeEditor.model.Code;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeRepository extends MongoRepository<Code, String> {
    List<Code> findByOriginalId(ObjectId originalId);
}
