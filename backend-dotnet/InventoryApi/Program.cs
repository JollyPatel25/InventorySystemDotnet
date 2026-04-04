using InventoryApi.Configurations;
using InventoryApi.Data;
using InventoryApi.Middleware;
using InventoryApi.Models.DTOs.Common;
using InventoryApi.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NpgsqlTypes;
using Serilog;
using Serilog.Sinks.PostgreSQL;
using System.Text;

Serilog.Debugging.SelfLog.Enable(Console.Error);

var builder = WebApplication.CreateBuilder(args);

// -------------------- SERILOG --------------------

var columnWriters = new Dictionary<string, ColumnWriterBase>
{
    { "id", new SinglePropertyColumnWriter("Id", PropertyWriteMethod.Raw, NpgsqlDbType.Uuid) },
    { "timestamp", new TimestampColumnWriter(NpgsqlDbType.Timestamp) },
    { "level", new LevelColumnWriter(true, NpgsqlDbType.Varchar) },
    { "message", new RenderedMessageColumnWriter(NpgsqlDbType.Text) },
    { "exception", new ExceptionColumnWriter(NpgsqlDbType.Text) },
    { "stacktrace", new SinglePropertyColumnWriter("StackTrace", PropertyWriteMethod.ToString, NpgsqlDbType.Text) },
    { "userid", new SinglePropertyColumnWriter("UserId", PropertyWriteMethod.Raw, NpgsqlDbType.Uuid) },
    { "organizationid", new SinglePropertyColumnWriter("OrganizationId", PropertyWriteMethod.Raw, NpgsqlDbType.Uuid) },
    { "requestpath", new SinglePropertyColumnWriter("RequestPath", PropertyWriteMethod.ToString, NpgsqlDbType.Text) },
    { "requestmethod", new SinglePropertyColumnWriter("RequestMethod", PropertyWriteMethod.ToString, NpgsqlDbType.Text) },
    { "ipaddress", new SinglePropertyColumnWriter("IPAddress", PropertyWriteMethod.ToString, NpgsqlDbType.Text) }
};

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.PostgreSQL(
        connectionString: builder.Configuration.GetConnectionString("DefaultConnection"),
        tableName: "applicationlogs",
        columnOptions: columnWriters,
        needAutoCreateTable: true)
    .CreateLogger();

builder.Host.UseSerilog();

// -------------------- DATABASE --------------------

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// -------------------- Service Registration --------------------

builder.Services.AddInfrastructureServices();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });


// -------------------- API VERSIONING --------------------

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

builder.Services.AddVersionedApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});


// -------------------- JWT Bearer Token Authentication--------------------

var jwtSettings = builder.Configuration.GetSection("Jwt");

var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // set false only in local dev
    options.SaveToken = true;

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine("AUTH FAILED: " + context.Exception);
            return Task.CompletedTask;
        }
    };

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

// -------------------- Add Authorization --------------------

builder.Services.AddAuthorization(options =>
{
    // Platform Admin Only
    options.AddPolicy("PlatformAdminOnly", policy =>
        policy.RequireClaim("PlatformAdmin", "True"));

    //  Organization Admin Only
    options.AddPolicy("OrgAdminOnly", policy =>
        policy.RequireClaim("PlatformAdmin", "False")
              .RequireRole("Admin"));

    //  (Future) Manager Policy
    options.AddPolicy("ManagerOnly", policy =>
        policy.RequireClaim("PlatformAdmin", "False")
              .RequireRole("Manager"));
});

// -------------------- ADD CLIENT FOR AI PREDICTION --------------------

builder.Services.AddHttpClient("AIService", client =>
{
    client.BaseAddress = new Uri("http://localhost:8000");
    client.Timeout = TimeSpan.FromSeconds(5);
});

// -------------------- CONTROLLERS --------------------

builder.Services.AddControllers();

// -------------------- SWAGGER --------------------

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "Inventory API", Version = "v1" });

    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter JWT Token"
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// -------------------- APP --------------------

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
    var email = builder.Configuration["BootstrapAdmin:Email"];
    var password = builder.Configuration["BootstrapAdmin:Password"];

    if (!context.Users.Any())
    {
        await authService.RegisterPlatformAdminAsync(new RegisterPlatformAdminDto
        {
            Email = email,
            Password = password,
            FirstName = "Jolly",
            LastName = "Patel",
            ContactNumber = "8160490971",
            Address = new AddressDto
            {
                Line1 = "Society",
                Line2 = "Bapunagar",
                City = "Ahmedabad",
                State = "Gujarat",
                Country = "India",
                PostalCode = "123456",
            },
        });

        Console.WriteLine("Platform Admin Seeded");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseMiddleware<SerilogContextMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();