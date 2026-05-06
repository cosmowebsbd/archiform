package com.archiform.domain.contact;

import com.archiform.domain.firm.FirmRepository;
import com.archiform.dto.contact.ContactInput;
import com.archiform.exception.ResourceNotFoundException;
import com.archiform.exception.UnauthorizedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class ContactService {

    private final ContactRepository contactRepository;
    private final FirmRepository firmRepository;

    public ContactService(ContactRepository contactRepository, FirmRepository firmRepository) {
        this.contactRepository = contactRepository;
        this.firmRepository = firmRepository;
    }

    @Transactional(readOnly = true)
    public List<Contact> getContactsByFirm(UUID firmId) {
        return contactRepository.findByFirmIdOrderByNameAsc(firmId);
    }

    @Transactional(readOnly = true)
    public Contact getById(UUID id, UUID firmId) {
        return contactRepository.findByIdAndFirmId(id, firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", id));
    }

    @Transactional
    public Contact createContact(ContactInput input, UUID firmId) {
        var firm = firmRepository.findById(firmId)
                .orElseThrow(() -> new ResourceNotFoundException("Firm", firmId));
        return contactRepository.save(Contact.builder()
                .firm(firm).name(input.getName()).email(input.getEmail())
                .phone(input.getPhone()).company(input.getCompany())
                .city(input.getCity()).country(input.getCountry()).notes(input.getNotes())
                .build());
    }

    @Transactional
    public Contact updateContact(UUID id, ContactInput input, UUID firmId) {
        Contact c = getById(id, firmId);
        if (input.getName() != null) c.setName(input.getName());
        if (input.getEmail() != null) c.setEmail(input.getEmail());
        if (input.getPhone() != null) c.setPhone(input.getPhone());
        if (input.getCompany() != null) c.setCompany(input.getCompany());
        if (input.getCity() != null) c.setCity(input.getCity());
        if (input.getCountry() != null) c.setCountry(input.getCountry());
        if (input.getNotes() != null) c.setNotes(input.getNotes());
        return contactRepository.save(c);
    }

    @Transactional
    public boolean deleteContact(UUID id, UUID firmId) {
        contactRepository.delete(getById(id, firmId));
        return true;
    }
}
