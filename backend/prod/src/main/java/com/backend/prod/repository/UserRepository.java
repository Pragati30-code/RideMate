package com.backend.prod.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.backend.prod.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}