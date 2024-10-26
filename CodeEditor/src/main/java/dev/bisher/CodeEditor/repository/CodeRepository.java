package dev.bisher.CodeEditor.repository;

import dev.bisher.CodeEditor.model.code.Code;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeRepository extends MongoRepository<Code, String> {
    List<Code> findByOriginalId(ObjectId originalId);
}
