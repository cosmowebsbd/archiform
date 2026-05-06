package com.archiform.graphql;

import com.archiform.domain.contact.Contact;
import com.archiform.domain.contact.ContactService;
import com.archiform.dto.contact.ContactInput;
import com.archiform.exception.UnauthorizedException;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import java.util.List;
import java.util.UUID;

@Controller
public class ContactController {
    private final ContactService contactService;
    public ContactController(ContactService contactService) { this.contactService = contactService; }

    @QueryMapping
    public List<Contact> contacts(DataFetchingEnvironment env) { return contactService.getContactsByFirm(extractFirmId(env)); }
    @QueryMapping
    public Contact contact(@Argument String id, DataFetchingEnvironment env) {
        return contactService.getById(UUID.fromString(id), extractFirmId(env));
    }
    @MutationMapping
    public Contact createContact(@Argument ContactInput input, DataFetchingEnvironment env) {
        return contactService.createContact(input, extractFirmId(env));
    }
    @MutationMapping
    public Contact updateContact(@Argument String id, @Argument ContactInput input, DataFetchingEnvironment env) {
        return contactService.updateContact(UUID.fromString(id), input, extractFirmId(env));
    }
    @MutationMapping
    public Boolean deleteContact(@Argument String id, DataFetchingEnvironment env) {
        return contactService.deleteContact(UUID.fromString(id), extractFirmId(env));
    }
    private UUID extractFirmId(DataFetchingEnvironment env) {
        Object v = env.getGraphQlContext().get("firmId");
        if (v == null) throw new UnauthorizedException();
        return UUID.fromString(v.toString());
    }
}
