package com.homevista.homevista.repository;

import com.homevista.homevista.entity.BlogPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {

    List<BlogPost> findByCategoryIgnoreCase(String category);
}