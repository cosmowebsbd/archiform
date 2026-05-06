package com.archiform.exception;
public class ResourceNotFoundException extends ArchiformException {
    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " not found with id: " + id);
    }
}
