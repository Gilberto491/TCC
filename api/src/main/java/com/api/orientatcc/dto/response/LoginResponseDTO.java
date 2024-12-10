package com.api.orientatcc.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@AllArgsConstructor
@Getter
@Setter
public class LoginResponseDTO {

    private String username;
    private Set<String> roles;
}
