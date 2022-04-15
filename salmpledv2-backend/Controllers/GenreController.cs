using Microsoft.AspNetCore.Mvc;
using salmpledv2_backend.Services;
using salmpledv2_backend.Models.DTOS;
using Microsoft.AspNetCore.Authorization;
namespace salmpledv2_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GenreController : ControllerBase
{

    private readonly IGenreService _GenreService;

    public GenreController(IGenreService GenreService)
    {
        _GenreService = GenreService;
    }

    [HttpPost("CreateGenre")]
    [Authorize]
    public async Task<IActionResult> CreateGenre([FromBody] GenreDTO genreDTO)
    {
        return Ok(await _GenreService.CreateGenre(genreDTO));
    }

    [HttpPost("GenreOptions")]
    public async Task<IActionResult> GenreOptions([FromBody] GenreDTO genreDTO)
    {
        return Ok(await _GenreService.GenreOptions(genreDTO));
    }

   


}
