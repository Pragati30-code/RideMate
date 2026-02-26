package com.backend.prod.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backend.prod.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}