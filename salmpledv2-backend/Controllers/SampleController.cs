using Microsoft.AspNetCore.Mvc;
using salmpledv2_backend.Services;
using salmpledv2_backend.Models.DTOS;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;
namespace salmpledv2_backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SampleController : ControllerBase
{

    private readonly ISampleService _SampleService;

    public SampleController(ISampleService SampleService)
    {
        _SampleService = SampleService;
    }

    [HttpPost("AddSample")]
    [Authorize]
    public async Task<IActionResult> AddSample([FromBody] AddSampleDTO sample)
    {
        
        return Ok(await _SampleService.AddSample(sample));
    }

    [HttpPost("RenameSamples")]
    [Authorize]
    public async Task<IActionResult> RenameSamples([FromBody] RenameSampleListDTO list)
    {
        return Ok(await _SampleService.RenameSamples(list));
    }

    [HttpPost("AddTags")]
    [Authorize]
    public async Task<IActionResult> AddTags([FromBody] AddTagListDTO list) {
       
        return Ok(await _SampleService.AddTags(list));
        
    }

    [HttpPost("RemoveSelected")]
    [Authorize]
    public async Task<IActionResult> RemoveSelected([FromBody] GenericListDTO list) {
        return Ok(await _SampleService.RemoveSelected(list));
    }

    
  



}
