using InventoryApi.Data;
using InventoryApi.Models.DTOs.Auth;
using InventoryApi.Models.DTOs.Organization;
using InventoryApi.Models.DTOs.Roles;
using InventoryApi.Models.Entities;
using InventoryApi.Models.Enums;
using InventoryApi.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InventoryApi.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    //  1️⃣ Register Platform Admin
    public async Task<User> RegisterPlatformAdminAsync(RegisterPlatformAdminDto dto)
    {
        // 🔹 Normalize inputs
        var email = dto.Email.ToLower().Trim();
        var firstName = dto.FirstName.Trim();
        var lastName = dto.LastName.Trim();

        // 🔹 Basic validations
        if (string.IsNullOrWhiteSpace(email))
            throw new Exception("Email is required.");

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8)
            throw new Exception("Password must be at least 8 characters long.");

        if (string.IsNullOrWhiteSpace(dto.ContactNumber))
            throw new Exception("Contact number is required.");

        if (dto.Address == null)
            throw new Exception("Address is required.");

        // 🔹 Check duplicate email
        if (await _context.Users.AnyAsync(u => u.Email == email))
            throw new Exception("Email already exists.");

        // 🔹 (Optional) Allow only one platform admin
        // Uncomment if needed
        /*
        if (await _context.Users.AnyAsync(u => u.IsPlatformAdmin))
            throw new Exception("Platform admin already exists.");
        */

        // 🔹 Create User
        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = firstName,
            LastName = lastName,
            ContactNumber = dto.ContactNumber.Trim(),

            Address = new Address
            {
                // 👉 adjust fields based on your Address entity
                Line1 = dto.Address.Line1,
                Line2 = dto.Address.Line2,
                City = dto.Address.City,
                State = dto.Address.State,
                Country = dto.Address.Country,
                PostalCode = dto.Address.PostalCode
            },

            IsPlatformAdmin = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        // 🔹 Save
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    //  2️⃣ Create Organization
    public async Task<Organization> CreateOrganizationAsync(CreateOrganizationDto dto)
    {
        // 🔹 Normalize inputs
        var email = dto.ContactEmail.ToLower().Trim();
        var name = dto.Name.Trim();
        var regNo = dto.RegistrationNumber.Trim();

        // 🔹 Basic validations
        if (dto.SubscriptionEndDate <= DateTime.UtcNow)
            throw new Exception("Subscription end date must be in the future.");

        // 🔹 Duplicate checks
        if (await _context.Organizations.AnyAsync(o => o.RegistrationNumber == regNo))
            throw new Exception("Organization with this registration number already exists.");

        if (await _context.Organizations.AnyAsync(o => o.ContactEmail == email))
            throw new Exception("Organization with this email already exists.");

        // 🔹 Map DTO → Entity
        var organization = new Organization
        {
            Name = name,
            RegistrationNumber = regNo,
            TaxIdentificationNumber = dto.TaxIdentificationNumber.Trim(),

            ContactEmail = email,
            ContactPhone = dto.ContactPhone.Trim(),

            SubscriptionEndDate = dto.SubscriptionEndDate,
            PlanType = dto.PlanType,

            IsActive = true,

            Address = new Address
            {
                // 👉 adjust fields based on your Address model
                Line1 = dto.Address.Line1,
                Line2 = dto.Address.Line2,
                City = dto.Address.City,
                State = dto.Address.State,
                Country = dto.Address.Country,
                PostalCode = dto.Address.PostalCode
            }
        };

        // 🔹 Save
        _context.Organizations.Add(organization);
        await _context.SaveChangesAsync();

        return organization;
    }

    // 3️⃣ Create Organization Admin
    public async Task<User> CreateOrgAdminAsync(CreateOrgAdminDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            throw new Exception("Email already exists.");

        if (!await _context.Organizations.AnyAsync(o => o.Id == dto.OrganizationId))
            throw new Exception("Organization not found.");

        var user = new User
        {
            Email = dto.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            ContactNumber = dto.ContactNumber,
            Address = new Address
            {
                Line1 = dto.Address.Line1,
                Line2 = dto.Address.Line2,
                City = dto.Address.City,
                State = dto.Address.State,
                Country = dto.Address.Country,
                PostalCode = dto.Address.PostalCode,

            },
            IsPlatformAdmin = false,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var userOrg = new UserOrganization
        {
            UserId = user.Id,
            OrganizationId = dto.OrganizationId,
            Role = UserRole.Admin,
            IsActive = true,
            IsDefault = true
        };

        _context.UserOrganizations.Add(userOrg);
        await _context.SaveChangesAsync();

        return user;
    }
    // 4️⃣ Login
    public async Task<String> LoginAsync(string email, string password)
    {
        email = email.ToLower().Trim();

        var user = await _context.Users
            .Include(u => u.UserOrganizations)
                .ThenInclude(uo => uo.Organization)
            .FirstOrDefaultAsync(u => u.Email == email && u.IsActive && !u.IsDeleted);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            throw new Exception("Invalid credentials.");

        // Platform admin
        if (user.IsPlatformAdmin)
        {
            return GenerateJwtToken(user, null, new List<string> { "Admin" });
        }

        // 🔥 Get default org
        var defaultOrg = user.UserOrganizations
            .Where(uo => uo.IsActive)
            .OrderByDescending(uo => uo.IsDefault)
            .FirstOrDefault();

        if (defaultOrg == null)
            throw new Exception("No active organization found.");

        var role = defaultOrg.Role.ToString();

        return GenerateJwtToken(user, defaultOrg.OrganizationId, new List<string> { role });
    }

    //  5️⃣ Generate JWT
    public string GenerateJwtToken(
    User user,
    Guid? organizationId,
    IEnumerable<string>? roles = null)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        var claims = new List<Claim>
    {
        new Claim("UserId", user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim("PlatformAdmin", user.IsPlatformAdmin.ToString())
    };

        if (organizationId.HasValue)
            claims.Add(new Claim("OrganizationId", organizationId.Value.ToString()));

        if (roles != null)
        {
            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["Key"]!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(jwtSettings["ExpiryMinutes"]!)),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<User> CreateUserWithRoleAsync(
    Guid organizationId,
    Guid currentUserId,
    UserRole currentUserRole,
    CreateUserWithRoleDto dto)
    {
        // 🔥 Role validation (VERY IMPORTANT)
        if (currentUserRole == UserRole.Manager && dto.Role != UserRole.Viewer)
            throw new Exception("Managers can only create Viewer users.");

        if (currentUserRole == UserRole.Admin &&
            (dto.Role == UserRole.Admin))
            throw new Exception("Org Admin cannot create another Admin.");

        // 🔹 Check duplicate email
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            throw new Exception("Email already exists.");

        // 🔹 Create User
        var user = new User
        {
            Email = dto.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            ContactNumber = dto.ContactNumber,
            Address = new Address
            {
                Line1 = dto.Address.Line1,
                Line2 = dto.Address.Line2,
                City = dto.Address.City,
                State = dto.Address.State,
                Country = dto.Address.Country,
                PostalCode = dto.Address.PostalCode
            },
            IsPlatformAdmin = false,
            IsActive = true
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // 🔹 Assign Role in Organization
        var hasAnyOrg = await _context.UserOrganizations
         .AnyAsync(uo => uo.UserId == user.Id && uo.IsActive);

        var userOrg = new UserOrganization
        {
            UserId = user.Id,
            OrganizationId = organizationId,
            Role = dto.Role,
            IsActive = true,
            IsDefault = !hasAnyOrg, // ✅ KEY LOGIC
            AssignedByUserId = currentUserId
        };

        _context.UserOrganizations.Add(userOrg);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<string> SwitchOrganizationAsync(Guid userId, Guid organizationId)
    {
        var user = await _context.Users
            .Include(u => u.UserOrganizations)
                .ThenInclude(uo => uo.Organization)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user == null)
            throw new Exception("User not found.");

        var userOrg = user.UserOrganizations
            .FirstOrDefault(uo => uo.OrganizationId == organizationId && uo.IsActive);

        if (userOrg == null)
            throw new Exception("User not assigned to this organization.");

        var org = userOrg.Organization;

        if (!org.IsActive || org.IsDeleted)
            throw new Exception("Organization inactive.");

        if (org.SubscriptionEndDate.Date < DateTime.UtcNow.Date)
            throw new Exception("Subscription expired.");

        var role = userOrg.Role.ToString();

        // 🔥 Update default on switch (optional but recommended)
        foreach (var uo in user.UserOrganizations.Where(x => x.IsDefault))
        {
            uo.IsDefault = false;
        }

        userOrg.IsDefault = true;

        await _context.SaveChangesAsync();

        return GenerateJwtToken(user, organizationId, new List<string> { role });
    }

    public async Task SetDefaultOrganizationAsync(Guid userId, Guid organizationId)
    {
        var user = await _context.Users
            .Include(u => u.UserOrganizations)
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (user == null)
            throw new Exception("User not found.");

        var userOrg = user.UserOrganizations
            .FirstOrDefault(uo => uo.OrganizationId == organizationId && uo.IsActive);

        if (userOrg == null)
            throw new Exception("User not assigned to this organization.");

        // 🔥 FIX 1: Remove existing default
        foreach (var uo in user.UserOrganizations.Where(x => x.IsDefault))
        {
            uo.IsDefault = false;
        }

        // 🔥 Set new default
        userOrg.IsDefault = true;

        await _context.SaveChangesAsync();
    }

}