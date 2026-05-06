package com.archiform.exception;
public class UnauthorizedException extends ArchiformException {
    public UnauthorizedException(String message) { super(message); }
    public UnauthorizedException() { super("Unauthorized"); }
}
