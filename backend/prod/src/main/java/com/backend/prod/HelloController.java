package com.backend.prod;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class HelloController {
    @GetMapping("/")
    public String hello(){
        return "carpool backend is running";
    }
    @GetMapping("/add")
    public int add(@RequestParam int a, @RequestParam int b) {
        return a+b;
    }
}
